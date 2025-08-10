import chalk from "chalk";
import fs from "fs";
import os from "os";
import generate_id from "../../lib/generate_id.js";
import get_target_database_connection from "../databases/get_target_database_connection.js";
import query_map from "../databases/queries/map.js";
import timestamps from "../../lib/timestamps.js";
import types from "../../lib/types.js";
import track_function_call from '../../test/track_function_call.js';

class Queue {
  constructor(queue_name = "", queue_options = {}) {
    this.init_database = this.init_database.bind(this);

    this.machine_id = fs
      .readFileSync(`${os.homedir()}/.cheatcode/MACHINE_ID`, "utf-8")
      ?.trim()
      .replace(/\n/g, "");
    this.name = queue_name;
    this.options = {
      concurrent_jobs: 1,
      ...queue_options,
    };

    this.init_database(this?.options?.external, this?.options?.database?.provider);
  }

  async init_database(is_external = false, database_provider = null) {
    const queues_database = database_provider || (get_target_database_connection("queues"))?.provider;
    const queue_queries_for_database_provider = query_map[queues_database]?.queues;
    const db = this._get_database_connection();

    if (types.is_object(db) && types.is_object(queue_queries_for_database_provider)) {
      this.db = Object.entries(queue_queries_for_database_provider || {})?.reduce(
        (bound_queries = {}, [query_function_name, query_function]) => {
          bound_queries[query_function_name] = query_function.bind({
            db,
            machine_id: this.machine_id,
            queue: {
              name: this.name,
              options: this.options,
            },
          });

          return bound_queries;
        },
        { connection: db },
      );

      // NOTE: Let an external queue manage its own configuration and operation. We only want
      // a connection to it so we can add jobs remotely.
      if (!is_external) {
        await this.db.initialize_database(queues_database);

        if (this?.options?.runOnStartup || this?.options?.run_on_startup) {
          this.run();
        }
      }
    }
  }

  _get_database_connection() {
    // NOTE: This applies to both external and internal databases being specified. If this is passed,
    // we assume that the database with the specified name exists on the process.
    if (this?.options?.database) {
      const { provider, name } = this?.options?.database;
      const existing_connection = process.databases && process.databases[provider] && process.databases[provider][name];

      if (!existing_connection) {
        console.warn(chalk.red(`Connection to database ${provider}.${name} not found on process. Cannot start queue.`));
      }

      return existing_connection || null;
    }

    // NOTE: Fallback to a default which assumes a single database flagged as queues: true in the
    // app's settings.<env>.json file.
    return process.databases._queues;
  }

  async add(options = {}) {
    // Use the new get_database_format method to determine format
    const date_format = timestamps.get_database_format(this?.db?._connection);
    
    // NOTE: If no next_run_at specified, run the job ASAP.
    let next_run_at;
    
    if ((options?.nextRunAt || options?.next_run_at) === "now" || 
        (!options?.nextRunAt && !options?.next_run_at)) {
      // Use "now" as the default
      next_run_at = timestamps.get_future_time(null, 0, { format: date_format });
    } else {
      // Normalize the provided date to the correct format
      next_run_at = timestamps.normalize_date(
        options?.nextRunAt || options?.next_run_at, 
        { format: date_format }
      );
    }
  
    const job_to_add = {
      _id: generate_id(16),
      status: "pending",
      environment: process.env.NODE_ENV,
      next_run_at,
      job: options?.job,
      payload: options?.payload,
    };
  
    const job_definition = this?.options?.jobs && this?.options?.jobs[options?.job];
  
    // NOTE: This doesn't work on an external queue because external queues
    // do not define the job, only the remote job does... rest of comment unchanged
    if (
      job_definition && (
        types.is_function(job_definition?.preflight?.onBeforeAdd) ||
        types.is_function(job_definition?.preflight?.on_before_add)
      )
    ) {
      const can_add_job = await (job_definition?.preflight?.onBeforeAdd || job_definition?.preflight?.on_before_add)(
        job_to_add,
        this.db._connection,
        `queue_${this.name}`
      );
  
      if (!can_add_job) {
        return null;
      }
    }
    
    this.db.add_job(job_to_add);
  }

  async _check_if_okay_to_run_jobs() {
    const jobs_running = await this._get_number_of_jobs_running();
    return jobs_running < (this.options.concurrentJobs || this.options.concurrent_jobs || 1);
  }

  _get_number_of_jobs_running() {
    return this.db.count_jobs("running");
  }

  _handle_requeue_jobs_running_before_restart() {
    // NOTE: If we don't want to rerun jobs that were running before restart,
    // mark them as incomplete and then return.
    if (!this.db) {
      return;
    }

    if (!this.options.retryJobsRunningBeforeRestart && !this.options.retry_jobs_running_before_restart) {
      return this.db.delete_incomplete_jobs_for_machine();
    }

    return this.db.set_jobs_for_machine_pending();
  }

  run() {
    if (!this.db) {
      return;
    }

    if (process.env.NODE_ENV !== 'test') {
      console.log(`Starting ${this.name} queue...`);
    }

    this._handle_requeue_jobs_running_before_restart().then(() => {
      this._start_queue_processor();
    });
  }

  _start_queue_processor() {
    const database_provider = this.db._connection?.constructor?.name?.toLowerCase() || 
                             this.db._connection?.client?.constructor?.name?.toLowerCase() ||
                             'unknown';

    if (database_provider.includes('redis')) {
      this._start_redis_event_driven_processor();
    } else if (database_provider.includes('mongo')) {
      this._start_mongodb_change_stream_processor();
    } else {
      // PostgreSQL and other databases fall back to adaptive polling
      this._start_adaptive_polling_processor();
    }
  }

  _start_redis_event_driven_processor() {
    const queue_channel = `queue_${this.name}_jobs`;
    
    // Subscribe to job notifications
    const subscriber = this.db._connection.duplicate();
    subscriber.subscribe(queue_channel);
    
    subscriber.on('message', async (channel, message) => {
      if (channel === queue_channel) {
        await this._process_available_jobs();
      }
    });

    // Also check for existing jobs on startup and periodically for scheduled jobs
    this._process_available_jobs();
    
    // Check for scheduled jobs every 5 seconds (much less frequent than before)
    this._scheduled_job_interval = setInterval(() => {
      this._process_available_jobs();
    }, 5000);
  }

  _start_mongodb_change_stream_processor() {
    const collection = this.db._connection.collection(`queue_${this.name}`);
    
    // Watch for insert and update operations on pending jobs
    const pipeline = [
      {
        $match: {
          $or: [
            // New jobs being inserted
            {
              'operationType': 'insert',
              'fullDocument.status': 'pending',
              'fullDocument.environment': process.env.NODE_ENV
            },
            // Jobs being updated to pending (requeued)
            {
              'operationType': 'update',
              'updateDescription.updatedFields.status': 'pending',
              'fullDocument.environment': process.env.NODE_ENV
            }
          ]
        }
      }
    ];

    this._change_stream = collection.watch(pipeline, { fullDocument: 'updateLookup' });
    
    this._change_stream.on('change', async (change) => {
      // Process jobs when new ones are added or requeued
      await this._process_available_jobs();
    });

    this._change_stream.on('error', (error) => {
      console.warn(`MongoDB change stream error for queue ${this.name}:`, error);
      // Fallback to polling if change stream fails
      this._start_adaptive_polling_processor();
    });

    // Process existing jobs on startup
    this._process_available_jobs();
    
    // Check for scheduled jobs every 5 seconds (for jobs with future next_run_at)
    this._scheduled_job_interval = setInterval(() => {
      this._process_available_jobs();
    }, 5000);
  }

  _start_adaptive_polling_processor() {
    let poll_interval = 100; // Start with 100ms
    const min_interval = 100;
    const max_interval = 2000;
    const backoff_multiplier = 1.5;
    const reset_multiplier = 0.8;

    const poll = async () => {
      const okay_to_run_jobs = await this._check_if_okay_to_run_jobs();
      
      if (okay_to_run_jobs && !process.env.HALT_QUEUES) {
        const next_job = await this.db.get_next_job_to_run();
        
        if (next_job) {
          // Job found - reset to faster polling
          poll_interval = Math.max(min_interval, poll_interval * reset_multiplier);
          this.handle_next_job(next_job);
        } else {
          // No job found - back off
          poll_interval = Math.min(max_interval, poll_interval * backoff_multiplier);
        }
      } else {
        // Can't run jobs - back off
        poll_interval = Math.min(max_interval, poll_interval * backoff_multiplier);
      }

      this._poll_timeout = setTimeout(poll, poll_interval);
    };

    poll();
  }

  async _process_available_jobs() {
    const okay_to_run_jobs = await this._check_if_okay_to_run_jobs();
    
    if (okay_to_run_jobs && !process.env.HALT_QUEUES) {
      const next_job = await this.db.get_next_job_to_run();
      if (next_job) {
        this.handle_next_job(next_job);
        // Check for more jobs immediately
        setImmediate(() => this._process_available_jobs());
      }
    }
  }

  async handle_next_job(next_job = {}) {
    const job_definition = this.options.jobs[next_job?.job];

    if (
      next_job &&
      next_job?.job &&
      job_definition &&
      types.is_function(job_definition?.run)
    ) {
      try {
        if (types.is_function(job_definition?.preflight?.okayToRun) || types.is_function(job_definition?.preflight?.okay_to_run)) {
          const okay_to_run = await (job_definition?.preflight?.okayToRun || job_definition?.preflight?.okay_to_run)(
          	next_job?.payload,
          	next_job
          );

          if (!okay_to_run) {
            return this._handle_requeue_job(
            	next_job,
            	timestamps.get_future_time(
            		'seconds',
            		(job_definition?.preflight?.requeueDelayInSeconds || job_definition?.preflight?.requeue_delay_in_seconds) || 10
            	)
            );
          }
        }

        if (types.is_number(job_definition?.maxAttempts) || types.is_number(job_definition?.max_attempts)) {
          if (next_job?.attempts >= parseInt(job_definition?.maxAttempts || job_definition?.max_attempts, 10)) {
            if (
            	types.is_function(job_definition?.onMaxAttemptsExhausted ) ||
            	types.is_function(job_definition?.on_max_attempts_exhausted)
            ) {
              await (job_definition.onMaxAttemptsExhausted || job_definition.on_max_attempts_exhausted)(next_job);
            }

            return this._handle_delete_job(next_job?._id);
          }
        }

        await this._log_attempt(next_job?._id);
        track_function_call(`node.queues.${this?.name}.jobs.${next_job?.job}`, [
          next_job?.payload,
        ]);

        await job_definition.run(next_job?.payload, {
          ...next_job,
          queue: this,
          completed: () => this._handle_job_completed(next_job?._id),
          failed: (error) => this._handle_job_failed(next_job, job_definition, error),
          delete: () => this._handle_delete_job(next_job?._id),
          requeue: (next_run_at = "") => this._handle_requeue_job(next_job, next_run_at),
        });
      } catch (exception) {
        console.warn(exception);
        this._handle_job_failed(next_job, job_definition, exception);
      }
    }
  }

  _log_attempt(job_id = "") {
    return this.db.log_attempt(job_id);
  }

  _handle_job_completed(job_id = "") {
    return this.db.set_job_completed(job_id);
  }

  _handle_job_failed(next_job = {}, job_definition = {}, error = "") {
    // Use the new get_database_format method
    const date_format = timestamps.get_database_format(this?.db?._connection);
    
    if (job_definition?.requeueOnFailure || job_definition?.requeue_on_failure) {
      return this._handle_requeue_job(
        next_job,
        timestamps.get_future_time('seconds', 10, { format: date_format }),
      );
    }
  
    return this.db.set_job_failed(next_job?._id, error);
  }

  _handle_delete_job(job_id = "") {
    return this.db.delete_job(job_id);
  }

  _handle_requeue_job(job = {}, next_run_at = null) {
    let normalized_date;
    
    if (next_run_at) {
      normalized_date = this._normalize_date_for_db(next_run_at);
    } else {
      normalized_date = this._normalize_date_for_db(new Date());
    }
    
    return this.db.requeue_job(job?._id, normalized_date);
  }

  _normalize_date_for_db(date_input) {
    // Use the new get_database_format method
    const date_format = timestamps.get_database_format(this?.db?._connection);
    return timestamps.normalize_date(date_input, { format: date_format });
  }

  stop() {
    if (this._scheduled_job_interval) {
      clearInterval(this._scheduled_job_interval);
      this._scheduled_job_interval = null;
    }
    
    if (this._poll_timeout) {
      clearTimeout(this._poll_timeout);
      this._poll_timeout = null;
    }
    
    if (this._change_stream) {
      this._change_stream.close();
      this._change_stream = null;
    }
  }

  list(status = "") {
    const query = {};

    if (status) {
      query.status = status;
    }

    return this.db.get_jobs(query);
  }

  async normalize_job_dates() {
    if (!this.db) {
      return { migrated: 0, error: "No database connection available" };
    }
    
    try {
      const is_postgresql = timestamps.get_database_format(this?.db?._connection) === 'postgresql';
      const all_jobs = await this.list();
      let migrated_count = 0;
      
      for (const job of all_jobs) {
        let updated = false;
        
        // Process each date field
        const date_fields = ['next_run_at', 'started_at', 'completed_at', 'failed_at'];
        const updates = {};
        
        for (const field of date_fields) {
          if (job[field]) {
            try {
              if (is_postgresql && typeof job[field] !== 'string') {
                updates[field] = job[field].toISOString();
                updated = true;
              } else if (!is_postgresql && typeof job[field] === 'string') {
                updates[field] = new Date(job[field]);
                updated = true;
              }
            } catch (e) {
              console.warn(`Could not normalize ${field} for job ${job._id}:`, e);
            }
          }
        }
        
        // If any updates are needed, update the job
        if (updated) {
          if (is_postgresql) {
            await this.db._connection.query(`
              UPDATE queue_${this.name}
              SET ${Object.keys(updates).map((field, i) => `${field} = $${i + 2}`).join(', ')}
              WHERE _id = $1
            `, [job._id, ...Object.values(updates)]);
          } else {
            await this.db._connection.collection(`queue_${this.name}`).updateOne(
              { _id: job._id },
              { $set: updates }
            );
          }
          migrated_count++;
        }
      }
      
      return { migrated: migrated_count, total: all_jobs.length };
    } catch (error) {
      console.error("Error normalizing job dates:", error);
      return { migrated: 0, error: error.message };
    }
  }  
}

export default Queue;

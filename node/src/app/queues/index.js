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
      console.log('INIT DATABASE FOR QUEUES');
      
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
        { _connection: db },
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
    // we assume that the database exists on the process.
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
    // NOTE: If no next_run_at specified, run the job ASAP.
    const next_run_at =
      (options?.nextRunAt || options?.next_run_at) === "now" || (!options?.nextRunAt && !options?.next_run_at)
        ? timestamps.get_future_time()
        : (options?.nextRunAt || options?.next_run_at);

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
    // do not define the job, only the remote job does. In an external setup,
    // we don't have access to the queue config, only a pointer to the
    // database for the queue. We opt to just add the job blindly, trusting
    // that the external queue will handle validation of the job run.
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
      setInterval(async () => {
        // NOTE: We want to respect concurrent_jobs limit here. If we've maxed out the concurrent
        // jobs limit for this queue, don't run anything until the number running is < than the
        // specified concurrent_jobs threshold.
        const okay_to_run_jobs = await this._check_if_okay_to_run_jobs();
        if (okay_to_run_jobs && !process.env.HALT_QUEUES) {
          const next_job = await this.db.get_next_job_to_run();
          this.handle_next_job(next_job);
        }
      }, 300);
    });
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
    if (job_definition?.requeueOnFailure || job_definition?.requeue_on_failure) {
      return this._handle_requeue_job(
        next_job,
        timestamps.get_future_time('seconds', 10),
      );
    }

    return this.db.set_job_failed(next_job?._id, error);
  }

  _handle_delete_job(job_id = "") {
    return this.db.delete_job(job_id);
  }

  _handle_requeue_job(job = {}, next_run_at = null) {
    return this.db.requeue_job(job?._id, next_run_at || timestamps.get_future_time());
  }

  list(status = "") {
    const query = {};

    if (status) {
      query.status = status;
    }

    return this.db.get_jobs(query);
  }
}

export default Queue;

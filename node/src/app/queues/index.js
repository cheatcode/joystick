import fs from "fs";
import os from "os";
import generateId from "../../lib/generateId";
import getTargetDatabaseProvider from "../databases/getTargetDatabaseProvider";
import queryMap from "../databases/queryMap";
import chalk from "chalk";
import timestamps from "../../lib/timestamps";

class Queue {
  constructor(queueName = "", queueOptions = {}) {
    this._initDatabase = this._initDatabase.bind(this);

    this.machineId = fs
      .readFileSync(`${os.homedir()}/.cheatcode/MACHINE_ID`, "utf-8")
      ?.trim()
      .replace(/\n/g, "");
    this.name = queueName;
    this.options = {
      concurrentJobs: 1,
      ...queueOptions,
    };

    this._initDatabase(this?.options?.external, this?.options?.database?.provider);
  }

  async _initDatabase(is_external = false, database_provider = null) {
    const queuesDatabase = database_provider || getTargetDatabaseProvider("queues");
    const queue_queries_for_database_provider = queryMap[queuesDatabase]?.queues;
    const db = this._getDatabaseConnection();

    if (db && queue_queries_for_database_provider && typeof queue_queries_for_database_provider === "object" && !Array.isArray(queue_queries_for_database_provider)) {
      this.db = Object.entries(queue_queries_for_database_provider || {})?.reduce(
        (boundQueries = {}, [queryFunctionName, queryFunction]) => {
          boundQueries[queryFunctionName] = queryFunction.bind({
            db,
            machineId: this.machineId,
            queue: {
              name: this.name,
              options: this.options,
            },
          });

          return boundQueries;
        },
        { _connection: db },
      );

      // NOTE: Let an external queue manage its own configuration and operation. We only want
      // a connection to it so we can add jobs remotely.
      if (!is_external) {
        await this.db.initializeDatabase(queuesDatabase);

        if (this?.options?.runOnStartup) {
          this.run();
        }
      }
    }
  }

  _getDatabaseConnection() {
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
    // NOTE: If no nextRunAt specified, run the job ASAP.
    const nextRunAt =
      options?.nextRunAt === "now" || !options?.nextRunAt
        ? new Date().toISOString()
        : options?.nextRunAt;

    const job_to_add = {
      _id: generateId(),
      status: "pending",
      environment: process.env.NODE_ENV,
      ...options,
      nextRunAt,
    };

    const job_definition = this?.options?.jobs && this?.options?.jobs[options?.job];

    // NOTE: This doesn't work on an external queue because external queues
    // do not define the job, only the remote job does. In an external setup,
    // we don't have access to the queue config, only a pointer to the
    // database for the queue. We opt to just add the job blindly, trusting
    // that the external queue will handle validation of the job run.
    if (
      job_definition &&
      typeof job_definition?.preflight?.onBeforeAdd === "function"
    ) {
      const canAddJob = await job_definition?.preflight?.onBeforeAdd(job_to_add, this.db._connection, `queue_${this.name}`);
      if (!canAddJob) {
        return null;
      }
    }
    
    this.db.addJob(job_to_add);
  }

  async _checkIfOkayToRunJobs() {
    const jobsRunning = await this._getNumberOfJobsRunning();
    return jobsRunning < this.options.concurrentJobs;
  }

  _getNumberOfJobsRunning() {
    return this.db.countJobs("running");
  }

  _handleRequeueJobsRunningBeforeRestart() {
    // NOTE: If we don't want to rerun jobs that were running before restart,
    // mark them as incomplete and then return.
    if (!this.db) {
      return;
    }

    if (!this.options.retryJobsRunningBeforeRestart) {
      return this.db.deleteIncompleteJobsForMachine();
    }

    return this.db.setJobsForMachinePending();
  }

  run() {
    if (!this.db) {
      return;
    }

    console.log(`Starting ${this.name} queue...`);

    this._handleRequeueJobsRunningBeforeRestart().then(() => {
      setInterval(async () => {
        // NOTE: We want to respect concurrentJobs limit here. If we've maxed out the concurrent
        // jobs limit for this queue, don't run anything until the number running is < than the
        // specified concurrentJobs threshold.
        const okayToRunJobs = await this._checkIfOkayToRunJobs();
        if (okayToRunJobs && !process.env.HALT_QUEUES) {
          const nextJob = await this.db.getNextJobToRun();
          this.handleNextJob(nextJob);
        }
      }, 300);
    });
  }

  async handleNextJob(nextJob = {}) {
    const job_definition = this.options.jobs[nextJob?.job];

    if (
      nextJob &&
      nextJob?.job &&
      job_definition &&
      typeof job_definition?.run === "function"
    ) {
      try {
        if (typeof job_definition?.preflight?.okayToRun === 'function') {
          const okay_to_run = await job_definition?.preflight?.okayToRun(nextJob?.payload, nextJob);

          if (!okay_to_run) {
            return this._handleRequeueJob(nextJob, timestamps.get_future_time('seconds', job_definition?.preflight?.requeueDelayInSeconds || 10));
          }
        }

        if (!isNaN(job_definition?.maxAttempts)) {
          if (nextJob?.attempts >= parseInt(job_definition?.maxAttempts, 10)) {
            if (typeof job_definition?.onMaxAttemptsExhausted === 'function') {
              await job_definition.onMaxAttemptsExhausted(nextJob);
            }

            return this._handleDeleteJob(nextJob?._id);
          }
        }

        await this._logAttempt(nextJob?._id);
        await job_definition.run(nextJob?.payload, {
          ...nextJob,
          queue: this,
          completed: () => this._handleJobCompleted(nextJob?._id),
          failed: (error) => this._handleJobFailed(nextJob, job_definition, error),
          delete: () => this._handleDeleteJob(nextJob?._id),
          requeue: (nextRunAt = "") =>
            this._handleRequeueJob(nextJob, nextRunAt),
        });
      } catch (exception) {
        this._handleJobFailed(nextJob, job_definition, exception);
      }
    }
  }

  _logAttempt(jobId = "") {
    return this.db.logAttempt(jobId);
  }

  _handleJobCompleted(jobId = "") {
    return this.db.setJobCompleted(jobId);
  }

  _handleJobFailed(nextJob = {}, job_definition = {}, error = "") {
    if (job_definition?.requeueOnFailure) {
      return this._handleRequeueJob(
        nextJob,
        timestamps.get_future_time('seconds', 10),
      );
    }

    return this.db.setJobFailed(nextJob?._id, error);
  }

  _handleDeleteJob(jobId = "") {
    return this.db.deleteJob(jobId);
  }

  _handleRequeueJob(job = {}, nextRunAt = new Date().toISOString()) {
    return this.db.requeueJob(job?._id, nextRunAt);
  }

  list(status = "") {
    const query = {};

    if (status) {
      query.status = status;
    }

    return this.db.getJobs(query);
  }
}

export default Queue;

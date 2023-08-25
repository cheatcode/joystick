import dayjs from "dayjs";
import fs from "fs";
import os from "os";
import generateId from "../../lib/generateId";
import getTargetDatabaseProvider from "../databases/getTargetDatabaseProvider";
import queryMap from "../databases/queryMap";

// TODO: Add a maxAttempts option to jobs so we don't run incessantly.
// TODO: Add a "hook" function for onMaxAttemptsExhausted() so you can do stuff like send emails/warnings/etc.

class Queue {
  constructor(queueName = "", queueOptions = {}) {
    this.machineId = fs
      .readFileSync(`${os.homedir()}/.cheatcode/MACHINE_ID`, "utf-8")
      ?.trim()
      .replace(/\n/g, "");
    this.name = queueName;
    this.options = {
      concurrentJobs: 1,
      ...queueOptions,
    };

    this._initDatabase();

    if (queueOptions?.runOnStartup) {
      this.run();
    }
  }

  async _initDatabase() {
    const queuesDatabase = getTargetDatabaseProvider("queues");
    const db = queryMap[queuesDatabase]?.queues;

    if (db && typeof db === "object" && !Array.isArray(db)) {
      this.db = Object.entries(db)?.reduce(
        (boundQueries = {}, [queryFunctionName, queryFunction]) => {
          boundQueries[queryFunctionName] = queryFunction.bind({
            machineId: this.machineId,
            queue: {
              name: this.name,
              options: this.options,
            },
          });

          return boundQueries;
        },
        {}
      );

      await this.db.initializeDatabase();
    }
  }

  add(options = {}) {
    // NOTE: If no nextRunAt specified, run the job ASAP.
    const nextRunAt =
      options?.nextRunAt === "now" || !options?.nextRunAt
        ? dayjs().format()
        : options?.nextRunAt;

    this.db.addJob({
      _id: generateId(),
      status: "pending",
      ...options,
      nextRunAt,
    });
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
      return this.db.setJobsForMachineIncomplete();
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
    if (
      nextJob &&
      nextJob?.job &&
      this.options.jobs[nextJob?.job] &&
      typeof this.options.jobs[nextJob?.job]?.run === "function"
    ) {
      try {
        await this.options.jobs[nextJob.job].run(nextJob?.payload, {
          ...nextJob,
          queue: this,
          completed: () => this._handleJobCompleted(nextJob?._id),
          failed: (error) => this._handleJobFailed(nextJob?._id, error),
          delete: () => this._handleDeleteJob(nextJob?._id),
          requeue: (nextRunAt = "") =>
            this._handleRequeueJob(nextJob, nextRunAt),
        });
      } catch (exception) {
        this._handleJobFailed(nextJob?._id, exception);

        if (this.options.jobs[nextJob.job]?.requeueOnFailure) {
          this._handleRequeueJob(
            nextRunAt,
            dayjs().add(10, "seconds").format()
          );
        }
      }
    }
  }

  _handleJobCompleted(jobId = "") {
    return this.db.setJobCompleted(jobId);
  }

  _handleJobFailed(jobId = "", error = "") {
    return this.db.setJobFailed(jobId, error);
  }

  _handleDeleteJob(jobId = "") {
    return this.db.deleteJob(jobId);
  }

  _handleRequeueJob(job = {}, nextRunAt = dayjs().format()) {
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

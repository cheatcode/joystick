import dayjs from "dayjs";
import fs from "fs";
import os from "os";
import generateId from "../../lib/generateId";
class Queue {
  constructor(queueName = "", queueOptions = {}) {
    if (!process?.databases?.mongodb) {
      return null;
    }
    this.machineId = fs.readFileSync(`${os.homedir()}/.cheatcode/MACHINE_ID`, "utf-8")?.trim().replace(/\n/g, "");
    this.db = process.databases.mongodb.collection(`queue_${queueName}`);
    this.db.createIndex({ status: 1 });
    this.db.createIndex({ status: 1, nextRunAt: 1 });
    if (queueOptions?.cleanup?.completedAfterSeconds) {
      this.db.createIndex({ completedAt: 1 }, { expireAfterSeconds: queueOptions?.cleanup?.completedAfterSeconds });
    }
    if (queueOptions?.cleanup?.failedAfterSeconds) {
      this.db.createIndex({ failedAt: 1 }, { expireAfterSeconds: queueOptions?.cleanup?.failedAfterSeconds });
    }
    this.name = queueName;
    this.options = {
      concurrentJobs: 1,
      ...queueOptions
    };
    if (queueOptions?.runOnStartup) {
      this.run();
    }
  }
  add(options = {}) {
    const nextRunAt2 = options?.nextRunAt === "now" || !options?.nextRunAt ? dayjs().format() : options?.nextRunAt;
    this.db.insertOne({
      _id: generateId,
      status: "pending",
      ...options,
      nextRunAt: nextRunAt2
    });
  }
  async _checkIfOkayToRunJobs() {
    const jobsRunning = await this._getNumberOfJobsRunning();
    return jobsRunning < this.options.concurrentJobs;
  }
  _getNumberOfJobsRunning() {
    return this.db.countDocuments({ status: "running" });
  }
  _handleRequeueJobsRunningBeforeRestart() {
    if (!this.options.retryJobsRunningBeforeRestart) {
      return this.db.updateMany({ status: "running", lockedBy: this.machineId }, {
        $set: {
          status: "incomplete"
        }
      });
    }
    return this.db.updateMany({ status: { $in: ["pending", "running"] }, lockedBy: this.machineId }, {
      $set: {
        status: "pending"
      },
      $unset: {
        lockedBy: ""
      }
    });
  }
  run() {
    console.log(`Starting ${this.name} queue...`);
    this._handleRequeueJobsRunningBeforeRestart().then(() => {
      setInterval(async () => {
        const okayToRunJobs = await this._checkIfOkayToRunJobs();
        if (okayToRunJobs && !process.env.HALT_QUEUES) {
          const nextJob = await this.db.findOneAndUpdate({
            $or: [
              {
                status: "pending",
                nextRunAt: { $lte: dayjs().format() },
                lockedBy: { $exists: false }
              },
              {
                status: "pending",
                nextRunAt: { $lte: dayjs().format() },
                lockedBy: null
              }
            ]
          }, {
            $set: {
              status: "running",
              startedAt: dayjs().format(),
              lockedBy: this.machineId
            }
          }, {
            sort: {
              nextRunAt: 1
            }
          });
          this._handleNextJob(nextJob?.value);
        }
      }, 300);
    });
  }
  _handleNextJob(nextJob = {}) {
    if (nextJob && nextJob?.job && this.options.jobs[nextJob?.job] && typeof this.options.jobs[nextJob?.job]?.run === "function") {
      try {
        this.options.jobs[nextJob.job].run(nextJob?.payload, {
          ...nextJob,
          queue: this,
          completed: () => this._handleJobCompleted(nextJob?._id),
          failed: (error) => this._handleJobFailed(nextJob?._id, error),
          delete: () => this._handleDeleteJob(nextJob?._id),
          update: (updateToApply = {}) => this._handleUpdateJob(nextJob?._id, updateToApply),
          requeue: (nextRunAt2 = "") => this._handleRequeueJob(nextJob, nextRunAt2)
        });
      } catch (exception) {
        this._handleJobFailed(nextJob?._id, exception);
        if (this.options.jobs[nextJob.job]?.requeueOnFailure) {
          this._handleRequeueJob(nextRunAt, dayjs().add(10, "seconds").format());
        }
      }
    }
  }
  _handleJobCompleted(jobId = "") {
    return this.db.updateOne({ _id: jobId }, {
      $set: {
        status: "completed",
        completedAt: dayjs().format()
      }
    });
  }
  _handleJobFailed(jobId = "", error = "") {
    return this.db.updateOne({ _id: jobId }, {
      $set: {
        status: "failed",
        failedAt: dayjs().format(),
        error
      }
    });
  }
  _handleDeleteJob(jobId = "") {
    return this.db.deleteOne({ _id: jobId });
  }
  _handleUpdateJob(jobId = "", update = {}) {
    return this.db.updateOne({ _id: jobId }, {
      $set: {
        ...update || {}
      }
    });
  }
  _handleRequeueJob(job = {}, nextRunAt2 = dayjs().format()) {
    return this.db.updateOne({ _id: job?._id }, {
      $set: {
        status: "pending",
        nextRunAt: nextRunAt2
      },
      $unset: {
        lockedBy: ""
      }
    });
  }
  list(status = "") {
    const query = {};
    if (status) {
      query.status = status;
    }
    return this.db.find(query).toArray();
  }
}
var queues_default = Queue;
export {
  queues_default as default
};

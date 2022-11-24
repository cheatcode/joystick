import dayjs from 'dayjs';
import generateId from "../../lib/generateId";

class Queue {
  constructor(queueName = '', queueOptions = {}) {
    if (!process?.databases?.mongodb) {
      // TODO: Temporary. This only supports MongoDB at the moment, so return null in the
      // event that mongodb isn't available.
      return null;
    }

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
      ...queueOptions,
    };

    if (queueOptions?.runOnStartup) {
      this.run();
    }
  }

  add(options = {}) {
    // NOTE: If no nextRunAt specified, run the job ASAP.
    const nextRunAt = options?.nextRunAt === 'now' || !options?.nextRunAt ? new Date().toISOString() : options?.nextRunAt;
    this.db.insertOne({
      _id: generateId,
      status: 'pending',
      ...options,
      nextRunAt,
    });
  }

  async _checkIfOkayToRunJobs() {
    const jobsRunning = await this._getNumberOfJobsRunning();
    return jobsRunning < this.options.concurrentJobs;
  }

  _getNumberOfJobsRunning() {
    return this.db.countDocuments({ status: 'running' });
  }

  _handleRequeueJobsRunningBeforeRestart() {
    // NOTE: If we don't want to rerun jobs that were running before restart,
    // mark them as incomplete and then return.
    if (!this.options.retryJobsRunningBeforeRestart) {
      return this.db.updateMany({ status: 'running' }, {
        $set: {
          status: 'incomplete',
        },
      });
    }

    // NOTE: Do NOT change the nextRunAt as we want priority to remain intact. Oldest jobs
    // should still be FIFO.
    return this.db.updateMany({ status: 'running' }, {
      $set: {
        status: 'pending',
      },
    });
  }

  run() {
    console.log(`Starting ${this.name} queue...`);
    this._handleRequeueJobsRunningBeforeRestart()
      .then(() => {
        setInterval(async () => {
          // NOTE: We want to respect concurrentJobs limit here. If we've maxed out the concurrent
          // jobs limit for this queue, don't run anything until the number running is < than the
          // specified concurrentJobs threshold.
          const okayToRunJobs = await this._checkIfOkayToRunJobs();
          if (okayToRunJobs && !process.env.HALT_QUEUES) {
            const nextJob = await this.db.findOneAndUpdate({
              status: 'pending',
              nextRunAt: { $lte: new Date().toISOString() },
            }, {
              $set: {
                status: 'running',
                startedAt: new Date().toISOString(),
              },
            }, {
              sort: {
                nextRunAt: 1,
              },
            });
    
            this._handleNextJob(nextJob?.value);
          }
        }, 300);
      });
  }

  _handleNextJob(nextJob = {}) {
    if (nextJob && nextJob?.job && this.options.jobs[nextJob?.job] && typeof this.options.jobs[nextJob?.job]?.run === 'function') {
      try {
        this.options.jobs[nextJob.job].run(nextJob?.payload, {
          ...nextJob,
          queue: this,
          completed: () => this._handleJobCompleted(nextJob?._id),
          failed: (error) => this._handleJobFailed(nextJob?._id, error),
          delete: () => this._handleDeleteJob(nextJob?._id),
          update: (updateToApply = {}) => this._handleUpdateJob(nextJob?._id, updateToApply),
          requeue: (nextRunAt = '') => this._handleRequeueJob(nextJob, nextRunAt),
        });
      } catch (exception) {
        this._handleJobFailed(nextJob?._id, exception);

        if (this.options.jobs[nextJob.job]?.requeueOnFailure) {
          this._handleRequeueJob(nextRunAt, dayjs().add(10, 'seconds').format());
        }
      }
    }
  }

  _handleJobCompleted(jobId = '') {
    return this.db.updateOne({ _id: jobId }, {
      $set: {
        status: 'completed',
        completedAt: new Date().toISOString(),
      },
    });
  }

  _handleJobFailed(jobId = '', error = '') {
    return this.db.updateOne({ _id: jobId }, {
      $set: {
        status: 'failed',
        failedAt: new Date().toISOString(),
        error,
      },
    });
  }

  _handleDeleteJob(jobId = '') {
    return this.db.deleteOne({ _id: jobId });
  }

  _handleUpdateJob(jobId = '', update = {}) {
    return this.db.updateOne({ _id: jobId }, {
      $set: {
        ...(update || {}),
      },
    });
  }

  _handleRequeueJob(job = {}, nextRunAt = new Date().toISOString()) {
    return this.db.updateOne({ _id: job?._id }, {
      $set: {
        status: 'pending',
        nextRunAt,
      },
    });
  }

  list(status = '') {
    const query = {};

    if (status) {
      query.status = status;
    }

    return this.db.find(query).toArray();
  }
}

export default Queue;

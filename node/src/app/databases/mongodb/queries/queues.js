import dayjs from "dayjs";

export default {
  addJob: function (jobToAdd = {}) {
    const db = process.databases._queues?.collection(`queue_${this.queue.name}`);
    return db.insertOne(jobToAdd);
  },
  countJobs: function (status = '') {
    const db = process.databases._queues?.collection(`queue_${this.queue.name}`);
    return db.countDocuments({ status });
  },
  deleteJob: function (jobId = '') {
    const db = process.databases._queues?.collection(`queue_${this.queue.name}`);
    return db.deleteOne({ _id: jobId });
  },
  getJobs: function (query = {}) {
    const db = process.databases._queues?.collection(`queue_${this.queue.name}`);
    return db.find(query).toArray();
  },
  getNextJobToRun: async function () {
    const db = process.databases._queues?.collection(`queue_${this.queue.name}`);

    const nextJob = await db.findOneAndUpdate({
      $or: [
        {
          status: 'pending',
          // NOTE: Do this to avoid accidentally running jobs intended for the future too early.
          nextRunAt: { $lte: dayjs().format() },
          lockedBy: { $exists: false }
        },
        {
          status: 'pending',
          // NOTE: Do this to avoid accidentally running jobs intended for the future too early.
          nextRunAt: { $lte: dayjs().format() },
          lockedBy: null,
        }
      ]
    }, {
      $set: {
        status: 'running',
        startedAt: dayjs().format(),
        lockedBy: this.machineId,
      },
    }, {
      sort: {
        nextRunAt: 1,
      },
    });

    return nextJob?.value;
  },
  initializeDatabase: function () {
    const db = process.databases._queues?.collection(`queue_${this.queue.name}`);

    db.createIndex({ status: 1 });
    db.createIndex({ status: 1, nextRunAt: 1 });

    if (this.queue.options?.cleanup?.completedAfterSeconds) {
      db.createIndex({ completedAt: 1 }, { expireAfterSeconds: this?.queue?.options?.cleanup?.completedAfterSeconds });
    }

    if (this.queue.options?.cleanup?.failedAfterSeconds) {
      db.createIndex({ failedAt: 1 }, { expireAfterSeconds: this?.queue?.options?.cleanup?.failedAfterSeconds });
    }
  },
  requeueJob: function (jobId = '', nextRunAt = null) {
    const db = process.databases._queues?.collection(`queue_${this.queue.name}`);
    return db.updateOne({ _id: jobId }, {
      $set: {
        status: 'pending',
        nextRunAt,
      },
      $unset: {
        lockedBy: '',
      }
    });
  },
  setJobsForMachineIncomplete: function () {
    const db = process.databases._queues?.collection(`queue_${this.queue.name}`);
    return db.updateMany({ status: 'running', lockedBy: this.machineId }, {
      $set: {
        status: 'incomplete',
      },
    });
  },
  setJobCompleted: function (jobId = '') {
    const db = process.databases._queues?.collection(`queue_${this.queue.name}`);
    return db.updateOne({ _id: jobId }, {
      $set: {
        status: 'completed',
        completedAt: dayjs().format(),
      },
    });
  },
  setJobFailed: function (jobId = '', error = '') {
    const db = process.databases._queues?.collection(`queue_${this.queue.name}`);
    return db.updateOne({ _id: jobId }, {
      $set: {
        status: 'failed',
        failedAt: dayjs().format(),
        error,
      },
    });
  },
  setJobsForMachinePending: function () {
    const db = process.databases._queues?.collection(`queue_${this.queue.name}`);
    
    // NOTE: Do NOT change the nextRunAt as we want priority to remain intact. Oldest jobs
    // should still be FIFO.
    return db.updateMany({ status: { $in: ['pending', 'running'] }, lockedBy: this.machineId }, {
      $set: {
        status: 'pending',
      },
      // NOTE: Unpin job from the machine that originally had it and toss it back in the queue
      // for any machine to pick it up.
      $unset: {
        lockedBy: '',
      }
    });
  },
};
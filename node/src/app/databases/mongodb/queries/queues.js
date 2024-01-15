import getTargetDatabaseProvider from '../../getTargetDatabaseProvider.js';

export default {
  addJob: function (jobToAdd = {}) {
    const db = this.db?.collection(`queue_${this.queue.name}`);
    return db.insertOne({
      ...jobToAdd,
      attempts: 0,
    });
  },
  countJobs: function (status = '') {
    const db = this.db?.collection(`queue_${this.queue.name}`);
    return db.countDocuments({ status, lockedBy: this.machineId });
  },
  deleteJob: function (jobId = '') {
    const db = this.db?.collection(`queue_${this.queue.name}`);
    return db.deleteOne({ _id: jobId });
  },
  deleteIncompleteJobsForMachine: function () {
    const db = this.db?.collection(`queue_${this.queue.name}`);
    return db.deleteMany({ status: { $in: ['incomplete', 'running'] }, lockedBy: this.machineId });
  },
  getJobs: function (query = {}) {
    const db = this.db?.collection(`queue_${this.queue.name}`);
    return db.find({
      ...query,
      environment: process.env.NODE_ENV,
    }).toArray();
  },
  getNextJobToRun: async function () {
    const db = this.db?.collection(`queue_${this.queue.name}`);

    const nextJob = await db.findOneAndUpdate({
      $or: [
        {
          status: 'pending',
          environment: process.env.NODE_ENV,
          // NOTE: Do this to avoid accidentally running jobs intended for the future too early.
          nextRunAt: { $lte: new Date().toISOString() },
          lockedBy: { $exists: false }
        },
        {
          status: 'pending',
          environment: process.env.NODE_ENV,
          // NOTE: Do this to avoid accidentally running jobs intended for the future too early.
          nextRunAt: { $lte: new Date().toISOString() },
          lockedBy: null,
        }
      ]
    }, {
      $set: {
        status: 'running',
        startedAt: new Date().toISOString(),
        lockedBy: this.machineId,
      },
    }, {
      sort: {
        nextRunAt: 1,
      },
    });

    return nextJob?.value;
  },
  initializeDatabase: async function () {
    try {
      await this.db.createCollection(`queue_${this.queue.name}`);
    } catch {}

    const db = this.db?.collection(`queue_${this.queue.name}`);

    const indexes = await db?.indexes();

    await db.createIndex({ status: 1 });
    await db.createIndex({ status: 1, nextRunAt: 1 });
    await db.createIndex({ status: 1, environment: 1, nextRunAt: 1, lockedBy: 1 });

    if (this.queue.options?.cleanup?.completedAfterSeconds) {
      if (indexes?.find((index) => index?.name === 'completedAt_1')) {
        await db.dropIndex({ completedAt: 1 });
      }

      await db.createIndex({ completedAt: 1 }, { expireAfterSeconds: this?.queue?.options?.cleanup?.completedAfterSeconds });
    }

    if (this.queue.options?.cleanup?.failedAfterSeconds) {
      if (indexes?.find((index) => index?.name === 'failedAt_1')) {
        await db.dropIndex({ failedAt: 1 });
      }

      await db.createIndex({ failedAt: 1 }, { expireAfterSeconds: this?.queue?.options?.cleanup?.failedAfterSeconds });
    }
  },
  logAttempt: function (jobId = '') {
    const db = this.db?.collection(`queue_${this.queue.name}`);
    return db.updateOne({ _id: jobId }, {
      $inc: {
        attempts: 1,
      },
    });
  },
  requeueJob: function (jobId = '', nextRunAt = null) {
    const db = this.db?.collection(`queue_${this.queue.name}`);
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
  setJobCompleted: function (jobId = '') {
    const db = this.db?.collection(`queue_${this.queue.name}`);
    return db.updateOne({ _id: jobId }, {
      $set: {
        status: 'completed',
        // NOTE: Format this way for ttl indexes.
        completedAt: new Date(new Date().toISOString()),
      },
    });
  },
  setJobFailed: function (jobId = '', error = '') {
    const db = this.db?.collection(`queue_${this.queue.name}`);
    return db.updateOne({ _id: jobId }, {
      $set: {
        status: 'failed',
        // NOTE: Format this way for ttl indexes.
        failedAt: new Date(new Date().toISOString()),
        error,
      },
    });
  },
  setJobsForMachinePending: function () {
    const db = this.db?.collection(`queue_${this.queue.name}`);
    
    // NOTE: Do NOT change the nextRunAt as we want priority to remain intact. Oldest jobs
    // should still be FIFO.
    return db.updateMany({
      status: { $in: ['pending', 'running'] },
      lockedBy: this.machineId
    }, {
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
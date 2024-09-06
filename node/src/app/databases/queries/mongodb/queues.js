import cluster from 'cluster';
import timestamps from '../../../../lib/timestamps.js';

const queues ={
  add_job: function (job_to_add = {}) {
    const db = this.db?.collection(`queue_${this.queue.name}`);
    return db.insertOne({
      ...job_to_add,
      created_by: this.machine_id,
      attempts: 0,
    });
  },
  count_jobs: function (status = '') {
    const db = this.db?.collection(`queue_${this.queue.name}`);
    return db.countDocuments({ status, locked_by: this.machine_id });
  },
  delete_job: function (job_id = '') {
    const db = this.db?.collection(`queue_${this.queue.name}`);
    return db.deleteOne({ _id: job_id });
  },
  delete_incomplete_jobs_for_machine: function () {
    const db = this.db?.collection(`queue_${this.queue.name}`);
    return db.deleteMany({ status: { $in: ['incomplete', 'running'] }, locked_by: this.machine_id });
  },
  get_jobs: function (query = {}) {
    const db = this.db?.collection(`queue_${this.queue.name}`);
    return db.find({
      ...query,
      environment: process.env.NODE_ENV,
    }).toArray();
  },
  get_next_job_to_run: async function () {
    const db = this.db?.collection(`queue_${this.queue.name}`);

    const no_existing_lock_query = {
      status: 'pending',
      environment: process.env.NODE_ENV,
      // NOTE: Do this to avoid accidentally running jobs intended for the future too early.
      next_run_at: { $lte: timestamps.get_current_time() },
      locked_by: { $exists: false },
    };

    const null_lock_query = {
      status: 'pending',
      environment: process.env.NODE_ENV,
      // NOTE: Do this to avoid accidentally running jobs intended for the future too early.
      next_run_at: { $lte: timestamps.get_current_time() },
      locked_by: null,
    };

    if (!this?.queue?.options?.share_jobs_with_other_machines) {
      no_existing_lock_query.created_by = this.machine_id;
      null_lock_query.created_by = this.machine_id;
    }

    console.log({
      no_existing_lock_query,
      null_lock_query,
    });

    const next_job = await db.findOneAndUpdate({
      $or: [
        no_existing_lock_query,
        null_lock_query,
      ]
    }, {
      $set: {
        status: 'running',
        started_at: timestamps.get_current_time(),
        locked_by: this.machine_id,
      },
    }, {
      sort: {
        next_run_at: 1,
      },
    });

    return next_job;
  },
  initialize_database: async function () {
    // NOTE: Add this check to avoid clustered apps from creating a race condition
    // when initializing indexes below (they step on each other's toes and cause
    // errors to be thrown). Only a primary or 1st worker should run this.

    if (cluster.isPrimary || (cluster.isWorker && cluster.worker.id === 1)) {
      try {
        await this.db.createCollection(`queue_${this.queue.name}`);
      } catch {
        // NOTE: Drop the error. We anticipate it after the first run.
      }

      const db = this.db?.collection(`queue_${this.queue.name}`);

      const indexes = await db?.indexes();

      await db.createIndex({ status: 1 });
      await db.createIndex({ status: 1, next_run_at: 1 });
      await db.createIndex({ status: 1, environment: 1, next_run_at: 1, locked_by: 1 });
      await db.createIndex({ status: 1, environment: 1, next_run_at: 1, locked_by: 1, created_at: 1 });

      if (this.queue.options?.cleanup?.completedAfterSeconds || this.queue.options?.cleanup?.completed_after_seconds) {
        if (indexes?.find((index) => index?.name === 'completed_at_1')) {
          await db.dropIndex({ completed_at: 1 });
        }

        await db.createIndex({ completed_at: 1 }, { expireAfterSeconds: this?.queue?.options?.cleanup?.completedAfterSeconds || this.queue.options?.cleanup?.completed_after_seconds });
      }

      if (this.queue.options?.cleanup?.failedAfterSeconds || this.queue.options?.cleanup?.failed_after_seconds) {
        if (indexes?.find((index) => index?.name === 'failed_at_1')) {
          await db.dropIndex({ failed_at: 1 });
        }

        await db.createIndex({ failed_at: 1 }, { expireAfterSeconds: this?.queue?.options?.cleanup?.failedAfterSeconds || this.queue.options?.cleanup?.failed_after_seconds });
      }
    }
  },
  log_attempt: function (job_id = '') {
    const db = this.db?.collection(`queue_${this.queue.name}`);
    return db.updateOne({ _id: job_id }, {
      $inc: {
        attempts: 1,
      },
    });
  },
  requeue_job: function (job_id = '', next_run_at = null) {
    const db = this.db?.collection(`queue_${this.queue.name}`);
    return db.updateOne({ _id: job_id }, {
      $set: {
        status: 'pending',
        next_run_at,
      },
      $unset: {
        locked_by: '',
      }
    });
  },
  set_job_completed: function (job_id = '') {
    const db = this.db?.collection(`queue_${this.queue.name}`);
    return db.updateOne({ _id: job_id }, {
      $set: {
        status: 'completed',
        // NOTE: Format this way for ttl indexes.
        completed_at: timestamps.get_current_time({ mongodb_ttl: true }),
      },
    });
  },
  set_job_failed: function (job_id = '', error = '') {
    const db = this.db?.collection(`queue_${this.queue.name}`);
    return db.updateOne({ _id: job_id }, {
      $set: {
        status: 'failed',
        // NOTE: Format this way for ttl indexes.
        failed_at: timestamps.get_current_time({ mongodb_ttl: true }),
        error,
      },
    });
  },
  set_jobs_for_machine_pending: function () {
    const db = this.db?.collection(`queue_${this.queue.name}`);
    
    // NOTE: Do NOT change the next_run_at as we want priority to remain intact. Oldest jobs
    // should still be FIFO.
    return db.updateMany({
      status: { $in: ['pending', 'running'] },
      locked_by: this.machine_id
    }, {
      $set: {
        status: 'pending',
      },
      // NOTE: Unpin job from the machine that originally had it and toss it back in the queue
      // for any machine to pick it up.
      $unset: {
        locked_by: '',
      }
    });
  },
};

export default queues;

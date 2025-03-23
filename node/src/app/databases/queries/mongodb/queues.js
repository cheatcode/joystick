import cluster from 'cluster';
import timestamps from '../../../../lib/timestamps.js';

const queues ={
  add_job: function (job_to_add = {}) {
    const db = this.db?.collection(`queue_${this.queue.name}`);
    // Ensure next_run_at is a proper Date object for MongoDB
    const next_run_at = job_to_add.next_run_at instanceof Date 
      ? job_to_add.next_run_at 
      : new Date(job_to_add.next_run_at);
    
    return db.insertOne({
      ...job_to_add,
      next_run_at, // Use the normalized Date object
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
  
    // Use the database format detector
    const format = timestamps.get_database_format(this.db);
    const current_time = timestamps.get_current_time({ format });
    
    const next_job = await db.findOneAndUpdate({
      $or: [
        {
          status: 'pending',
          environment: process.env.NODE_ENV,
          // Handle both Date objects and ISO strings in existing data
          $or: [
            { next_run_at: { $lte: current_time } },
            { next_run_at: { $lte: current_time.toISOString() } }
          ],
          locked_by: { $exists: false }
        },
        {
          status: 'pending',
          environment: process.env.NODE_ENV,
          // Handle both Date objects and ISO strings in existing data
          $or: [
            { next_run_at: { $lte: current_time } },
            { next_run_at: { $lte: current_time.toISOString() } }
          ],
          locked_by: null,
        }
      ]
    }, {
      $set: {
        status: 'running',
        started_at: timestamps.get_current_time({ format: 'mongodb' }),
        locked_by: this.machine_id,
      },
    }, {
      sort: {
        next_run_at: 1,
      },
    });
  
    // When reading a job, ensure all date fields are normalized
    if (next_job) {
      if (next_job.next_run_at && typeof next_job.next_run_at === 'string') {
        next_job.next_run_at = new Date(next_job.next_run_at);
      }
      if (next_job.started_at && typeof next_job.started_at === 'string') {
        next_job.started_at = new Date(next_job.started_at);
      }
      if (next_job.completed_at && typeof next_job.completed_at === 'string') {
        next_job.completed_at = new Date(next_job.completed_at);
      }
      if (next_job.failed_at && typeof next_job.failed_at === 'string') {
        next_job.failed_at = new Date(next_job.failed_at);
      }
    }
  
    return next_job;
  },
  initialize_database: async function () {
    if (cluster.isPrimary || (cluster.isWorker && cluster.worker.id === 1)) {
      const collection_name = `queue_${this.queue.name}`;
      
      const collections = await this.db.listCollections().toArray();
      if (!collections.some(collection => collection.name === collection_name)) {
        await this.db.createCollection(collection_name);
      }
  
      const db = this.db.collection(collection_name);
  
      const existing_indexes = await db.indexes();
  
      const create_index_if_not_exists = async (index_spec, options = {}) => {
        const index_name = Object.keys(index_spec).join('_');
        if (!existing_indexes.some(index => index.name === index_name)) {
          await db.createIndex(index_spec, options);
        }
      };
  
      await create_index_if_not_exists({ status: 1 });
      await create_index_if_not_exists({ status: 1, next_run_at: 1 });
      await create_index_if_not_exists({ status: 1, environment: 1, next_run_at: 1, locked_by: 1 });
  
      const completed_after_seconds = this.queue.options?.cleanup?.completedAfterSeconds || this.queue.options?.cleanup?.completed_after_seconds;
      if (completed_after_seconds) {
        const index_name = 'completed_at_1';
        const existing_index = existing_indexes.find(index => index.name === index_name);
        if (existing_index && existing_index.expireAfterSeconds !== completed_after_seconds) {
          await db.dropIndex(index_name);
          await create_index_if_not_exists({ completed_at: 1 }, { expireAfterSeconds: completed_after_seconds });
        } else if (!existing_index) {
          await create_index_if_not_exists({ completed_at: 1 }, { expireAfterSeconds: completed_after_seconds });
        }
      }
  
      const failed_after_seconds = this.queue.options?.cleanup?.failedAfterSeconds || this.queue.options?.cleanup?.failed_after_seconds;
      if (failed_after_seconds) {
        const index_name = 'failed_at_1';
        const existing_index = existing_indexes.find(index => index.name === index_name);
        if (existing_index && existing_index.expireAfterSeconds !== failed_after_seconds) {
          await db.dropIndex(index_name);
          await create_index_if_not_exists({ failed_at: 1 }, { expireAfterSeconds: failed_after_seconds });
        } else if (!existing_index) {
          await create_index_if_not_exists({ failed_at: 1 }, { expireAfterSeconds: failed_after_seconds });
        }
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
        completed_at: timestamps.get_current_time({ 
          format: timestamps.get_database_format(this.db) 
        }),
      },
    });
  },
  set_job_failed: function (job_id = '', error = '') {
    const db = this.db?.collection(`queue_${this.queue.name}`);
    return db.updateOne({ _id: job_id }, {
      $set: {
        status: 'failed',
        failed_at: timestamps.get_current_time({ 
          format: timestamps.get_database_format(this.db) 
        }),
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

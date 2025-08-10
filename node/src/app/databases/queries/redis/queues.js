import cluster from 'cluster';
import timestamps from '../../../../lib/timestamps.js';

const queues = {
  add_job: async function (job_to_add = {}) {
    const queue_name = `queue_${this.queue.name}`;
    const job_key = `job:${job_to_add._id}`;
    const scheduled_jobs_key = `${queue_name}:scheduled`;
    
    // Store job data in a hash
    const job_data = {
      ...job_to_add,
      attempts: 0,
      next_run_at: job_to_add.next_run_at instanceof Date 
        ? job_to_add.next_run_at.toISOString() 
        : job_to_add.next_run_at,
    };
    
    // Convert all values to strings for Redis hash storage
    const redis_job_data = {};
    for (const [key, value] of Object.entries(job_data)) {
      if (typeof value === 'object' && value !== null) {
        redis_job_data[key] = JSON.stringify(value);
      } else {
        redis_job_data[key] = String(value);
      }
    }
    
    await this.db.hset(job_key, redis_job_data);
    
    // Add to scheduled jobs sorted set with timestamp as score
    const next_run_timestamp = new Date(job_data.next_run_at).getTime();
    await this.db.zadd(scheduled_jobs_key, { score: next_run_timestamp, value: job_to_add._id });
    
    return { insertedId: job_to_add._id };
  },

  count_jobs: async function (status = '') {
    const queue_name = `queue_${this.queue.name}`;
    
    if (status === 'running') {
      const locked_key = `${queue_name}:locked:${this.machine_id}`;
      const locked_jobs = await this.db.smembers(locked_key);
      return locked_jobs.length;
    }
    
    if (status === 'pending') {
      const scheduled_jobs_key = `${queue_name}:scheduled`;
      const scheduled_jobs = await this.db.zrange(scheduled_jobs_key, 0, -1);
      return scheduled_jobs.length;
    }
    
    const status_key = `${queue_name}:${status}`;
    const status_jobs = await this.db.smembers(status_key);
    return status_jobs.length;
  },

  delete_job: async function (job_id = '') {
    const queue_name = `queue_${this.queue.name}`;
    const job_key = `job:${job_id}`;
    
    // Remove from all possible sets and sorted sets
    return await this.db.client.multi()
      .del(job_key)
      .zRem(`${queue_name}:scheduled`, job_id)
      .sRem(`${queue_name}:pending`, job_id)
      .sRem(`${queue_name}:running`, job_id)
      .sRem(`${queue_name}:completed`, job_id)
      .sRem(`${queue_name}:failed`, job_id)
      .sRem(`${queue_name}:locked:${this.machine_id}`, job_id)
      .exec();
  },

  delete_incomplete_jobs_for_machine: async function () {
    const queue_name = `queue_${this.queue.name}`;
    const locked_key = `${queue_name}:locked:${this.machine_id}`;
    
    const locked_jobs = await this.db.smembers(locked_key);
    
    if (locked_jobs.length > 0) {
      let multi = this.db.client.multi();
      
      for (const job_id of locked_jobs) {
        multi = multi.del(`job:${job_id}`).sRem(`${queue_name}:running`, job_id);
      }
      
      return await multi.del(locked_key).exec();
    }
    
    return [];
  },

  get_jobs: async function (query = {}) {
    const queue_name = `queue_${this.queue.name}`;
    let job_ids = [];
    
    if (query.status) {
      if (query.status === 'pending') {
        // For pending status, get jobs from scheduled set
        const scheduled_jobs = await this.db.zrange(`${queue_name}:scheduled`, 0, -1);
        job_ids = scheduled_jobs;
      } else {
        // For other statuses, get from status sets
        const status_key = `${queue_name}:${query.status}`;
        job_ids = await this.db.smembers(status_key);
      }
    } else {
      // Get all jobs from all status sets
      const statuses = ['running', 'completed', 'failed'];
      for (const status of statuses) {
        const status_jobs = await this.db.smembers(`${queue_name}:${status}`);
        job_ids.push(...status_jobs);
      }
      
      // Also get scheduled jobs (these are pending)
      const scheduled_jobs = await this.db.zrange(`${queue_name}:scheduled`, 0, -1);
      job_ids.push(...scheduled_jobs);
    }
    
    const jobs = [];
    for (const job_id of job_ids) {
      const job_data = await this.db.hgetall(`job:${job_id}`);
      if (Object.keys(job_data).length > 0) {
        // Filter by environment
        if (job_data.environment === process.env.NODE_ENV) {
          // Parse JSON strings back to objects where needed
          const parsed_job_data = { ...job_data };
          for (const [key, value] of Object.entries(parsed_job_data)) {
            if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
              try {
                parsed_job_data[key] = JSON.parse(value);
              } catch (e) {
                // Keep as string if not valid JSON
              }
            }
          }
          
          jobs.push({
            ...parsed_job_data,
            attempts: parseInt(parsed_job_data.attempts, 10),
          });
        }
      }
    }
    
    return jobs;
  },

  get_next_job_to_run: async function () {
    const queue_name = `queue_${this.queue.name}`;
    const scheduled_jobs_key = `${queue_name}:scheduled`;
    const pending_key = `${queue_name}:pending`;
    const running_key = `${queue_name}:running`;
    const locked_key = `${queue_name}:locked:${this.machine_id}`;
    
    const current_time = Date.now();
    
    // Get jobs that are ready to run from scheduled set
    const ready_jobs = await this.db.zrangebyscore(scheduled_jobs_key, 0, current_time, {
      LIMIT: { offset: 0, count: 1 }
    });
    
    if (ready_jobs.length === 0) {
      return null;
    }
    
    const job_id = ready_jobs[0];
    const job_key = `job:${job_id}`;
    const job_data = await this.db.hgetall(job_key);
    
    if (!job_data || Object.keys(job_data).length === 0) {
      // Clean up orphaned job reference
      await this.db.zrem(scheduled_jobs_key, job_id);
      return null;
    }
    
    // Check if job matches environment and isn't locked
    if (job_data.environment !== process.env.NODE_ENV) {
      return null;
    }
    
    // Move job to running state atomically
    const results = await this.db.client.multi()
      .zRem(scheduled_jobs_key, job_id)
      .sRem(pending_key, job_id)
      .sAdd(running_key, job_id)
      .sAdd(locked_key, job_id)
      .hSet(job_key, {
        status: 'running',
        started_at: timestamps.get_current_time({ format: 'redis' }),
        locked_by: String(this.machine_id),
      })
      .exec();
    
    // Parse JSON strings back to objects where needed
    const parsed_job_data = { ...job_data };
    for (const [key, value] of Object.entries(parsed_job_data)) {
      if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
        try {
          parsed_job_data[key] = JSON.parse(value);
        } catch (e) {
          // Keep as string if not valid JSON
        }
      }
    }
    
    // Return the updated job data
    return {
      ...parsed_job_data,
      _id: job_id,
      status: 'running',
      started_at: timestamps.get_current_time({ format: 'redis' }),
      locked_by: this.machine_id,
      attempts: parseInt(parsed_job_data.attempts, 10),
    };
  },

  initialize_database: async function () {
    if (cluster.isPrimary || (cluster.isWorker && cluster.worker.id === 1)) {
      // Redis doesn't require explicit database initialization like MongoDB collections
      // or PostgreSQL tables. The keys will be created as needed.
      
      // However, we can set up any cleanup jobs or TTL policies here if needed
      const queue_name = `queue_${this.queue.name}`;
      
      // Set up cleanup for completed jobs if specified
      const completed_after_seconds = this.queue.options?.cleanup?.completedAfterSeconds || 
                                     this.queue.options?.cleanup?.completed_after_seconds;
      
      if (completed_after_seconds) {
        // Note: Redis TTL cleanup would need to be handled differently
        // This is a placeholder for future implementation
      }
    }
  },

  log_attempt: async function (job_id = '') {
    const job_key = `job:${job_id}`;
    const current_attempts = await this.db.hget(job_key, 'attempts') || '0';
    return await this.db.hset(job_key, 'attempts', (parseInt(current_attempts, 10) + 1).toString());
  },

  requeue_job: async function (job_id = '', next_run_at = null) {
    const queue_name = `queue_${this.queue.name}`;
    const job_key = `job:${job_id}`;
    const scheduled_jobs_key = `${queue_name}:scheduled`;
    const running_key = `${queue_name}:running`;
    const locked_key = `${queue_name}:locked:${this.machine_id}`;
    
    const next_run_timestamp = next_run_at ? new Date(next_run_at).getTime() : Date.now();
    
    return await this.db.client.multi()
      .sRem(running_key, job_id)
      .sRem(locked_key, job_id)
      .zAdd(scheduled_jobs_key, { score: next_run_timestamp, value: job_id })
      .hSet(job_key, {
        status: 'pending',
        next_run_at: next_run_at ? new Date(next_run_at).toISOString() : new Date().toISOString(),
      })
      .hDel(job_key, 'locked_by')
      .exec();
  },

  set_job_completed: async function (job_id = '') {
    const queue_name = `queue_${this.queue.name}`;
    const job_key = `job:${job_id}`;
    const running_key = `${queue_name}:running`;
    const completed_key = `${queue_name}:completed`;
    const locked_key = `${queue_name}:locked:${this.machine_id}`;
    
    return await this.db.client.multi()
      .sRem(running_key, job_id)
      .sRem(locked_key, job_id)
      .sAdd(completed_key, job_id)
      .hSet(job_key, {
        status: 'completed',
        completed_at: timestamps.get_current_time({ format: 'redis' }),
      })
      .exec();
  },

  set_job_failed: async function (job_id = '', error = '') {
    const queue_name = `queue_${this.queue.name}`;
    const job_key = `job:${job_id}`;
    const running_key = `${queue_name}:running`;
    const failed_key = `${queue_name}:failed`;
    const locked_key = `${queue_name}:locked:${this.machine_id}`;
    
    return await this.db.client.multi()
      .sRem(running_key, job_id)
      .sRem(locked_key, job_id)
      .sAdd(failed_key, job_id)
      .hSet(job_key, {
        status: 'failed',
        failed_at: timestamps.get_current_time({ format: 'redis' }),
        error: error.toString(),
      })
      .exec();
  },

  set_jobs_for_machine_pending: async function () {
    const queue_name = `queue_${this.queue.name}`;
    const locked_key = `${queue_name}:locked:${this.machine_id}`;
    const running_key = `${queue_name}:running`;
    const scheduled_jobs_key = `${queue_name}:scheduled`;
    
    const locked_jobs = await this.db.smembers(locked_key);
    
    if (locked_jobs.length > 0) {
      let multi = this.db.client.multi();
      
      for (const job_id of locked_jobs) {
        const job_key = `job:${job_id}`;
        
        // Get current next_run_at to preserve priority
        const next_run_at = await this.db.hget(job_key, 'next_run_at');
        const next_run_timestamp = next_run_at ? new Date(next_run_at).getTime() : Date.now();
        
        multi = multi
          .sRem(running_key, job_id)
          .zAdd(scheduled_jobs_key, { score: next_run_timestamp, value: job_id })
          .hSet(job_key, { status: 'pending' })
          .hDel(job_key, 'locked_by');
      }
      
      return await multi.del(locked_key).exec();
    }
    
    return [];
  },
};

export default queues;

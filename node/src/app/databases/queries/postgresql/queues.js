import cron from 'node-cron';
import cluster from 'cluster';
import handle_cleanup_queues from '../../postgresql/handle_cleanup_queues.js';
import timestamps from "../../../../lib/timestamps.js";
import wait from '../../../../lib/wait.js';

const queues = {
  add_job: async function (job_to_add = {}) {
    const db = this?.db;

    // NOTE: Ensure that table was created via initialize_database on first startup. If not, wait 1s
    // while PostgreSQL creates the table.
    const [existing_table] = await db?.query(`SELECT * FROM information_schema.tables WHERE table_name = $1`, [
      `queue_${this.queue.name}`
    ]);

    if (!existing_table) {
      await wait(1);
    }

    return db?.query(`
      INSERT INTO queue_${this.queue.name} (
        _id,
        status,
        environment,
        job,
        payload,
        next_run_at,
        attempts,
        created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8
      )
    `, [
      job_to_add?._id,
      job_to_add?.status,
      job_to_add?.environment,
      job_to_add?.job,
      JSON.stringify(job_to_add?.payload),
      job_to_add?.nextRunAt || job_to_add?.next_run_at,
      0,
      this.machine_id
    ]);
  },
  count_jobs: async function (status = '') {
    const db = this?.db;

    const [jobs] = await db?.query(`
      SELECT
        count(*)
      FROM
        queue_${this.queue.name}
      WHERE
        status = $1
      AND
        locked_by = $2
    `, [
      status,
      this.machine_id
    ]);

    return Promise.resolve(jobs.count);
  },
  delete_job: function (job_id = '') {
    const db = this?.db;

    return db?.query(`
      DELETE FROM
        queue_${this.queue.name}
      WHERE
        _id = $1
    `, [
      job_id
    ]);
  },
  delete_incomplete_jobs_for_machine: function () {
    const db = this?.db;
    return db?.query(`
      DELETE FROM
        queue_${this.queue.name}
      WHERE
        status = ANY($1)
      AND
        locked_by = $2
    `, [
      ['incomplete', 'running'],
      this.machine_id,
    ]);
  },
  get_jobs: function (query = {}) {
    const db = this?.db;

    return db?.query(`
      SELECT * FROM
        queue_${this.queue.name}
      ${query?.status ? `
        WHERE
          status = $1
        AND
          environment = $2
      ` : ''}
    `, [
      query?.status,
      process.env.NODE_ENV,
    ]);
  },
  get_next_job_to_run: async function () {
    const db = this?.db;

    let next_job_query = `
      SELECT * FROM
        queue_${this.queue.name}
      WHERE
        status = $1
      AND
        environment = $2
      AND
        next_run_at::timestamp <= $3
      AND
        locked_by IS NULL
      ORDER BY
        next_run_at ASC
    `;

    const next_job_query_values = [
      'pending',
      process.env.NODE_ENV,
      timestamps.get_current_time()
    ];

    if (!this?.queue?.options?.share_jobs_with_other_machines) {
      next_job_query = `
        SELECT * FROM
          queue_${this.queue.name}
        WHERE
          status = $1
        AND
          environment = $2
        AND
          next_run_at::timestamp <= $3
        AND
          locked_by IS NULL
        AND
          created_by = $4
        ORDER BY
          next_run_at ASC
      `;

      next_job_query_values.push(this.machine_id);
    }

    const [next_job] = await db?.query(next_job_query, next_job_query_values);

    if (next_job?._id) {
      await db?.query(`
        UPDATE
          queue_${this.queue.name}
        SET
          status = $1,
          started_at = $2,
          locked_by = $3
        WHERE
          _id = $4
      `, [
        'running',
        timestamps.get_current_time(),
        this.machine_id,
        next_job?._id,
      ]);
    }

    return next_job ? {
      ...next_job,
      payload: next_job?.payload ? JSON.parse(next_job?.payload || '') : {},
    } : {};
  },
  initialize_database: async function () {
    // NOTE: Add this check to avoid clustered apps from creating a race condition
    // when initializing indexes below (they step on each other's toes and cause
    // errors to be thrown). Only a primary or 1st worker should run this.

    if (cluster.isPrimary || (cluster.isWorker && cluster.worker.id === 1)) {
      const db = this?.db;

      await db?.query(`
        CREATE TABLE IF NOT EXISTS queue_${this.queue.name} (
          _id text PRIMARY KEY,
          status text,
          job text,
          payload text,
          next_run_at text,
          locked_by text,
          started_at text,
          completed_at text,
          failed_at text,
          error text,
          environment text,
          attempts smallint,
          created_by text
        )
      `);

      // NOTE: Add additional attempts field as a standalone column to support existing queue_ tables.
      await db?.query(`ALTER TABLE queue_${this.queue.name} ADD COLUMN IF NOT EXISTS environment text`);
      await db?.query(`ALTER TABLE queue_${this.queue.name} ADD COLUMN IF NOT EXISTS attempts smallint`);
      await db?.query(`ALTER TABLE queue_${this.queue.name} ADD COLUMN IF NOT EXISTS created_by text`);

      await db?.query(`CREATE INDEX IF NOT EXISTS status_index ON queue_${this.queue.name} (status)`);
      await db?.query(`CREATE INDEX IF NOT EXISTS status_next_run_at_index ON queue_${this.queue.name} (status, next_run_at)`);
      await db?.query(`CREATE INDEX IF NOT EXISTS next_job_index ON queue_${this.queue.name} (status, environment, next_run_at, locked_by)`);
      await db?.query(`CREATE INDEX IF NOT EXISTS next_job_owner_index ON queue_${this.queue.name} (status, environment, next_run_at, locked_by, created_by)`);

      await db?.query(`CREATE INDEX IF NOT EXISTS completed_at_index ON queue_${this.queue.name} (completed_at)`);
      await db?.query(`CREATE INDEX IF NOT EXISTS failed_at_index ON queue_${this.queue.name} (failed_at)`);

      // NOTE: PostgreSQL does NOT have a TTL index or event-based row expiration feature,
      // so we "polyfill" here with 30 second cron jobs to do the cleanup for us.
      if (this.queue.options?.cleanup?.completedAfterSeconds || this.queue.options?.cleanup?.completed_after_seconds) {
        cron.schedule('*/30 * * * * *', () => {
          handle_cleanup_queues({
            database: db,
            table: `queue_${this.queue.name}`,
            seconds: this.queue.options?.cleanup?.completedAfterSeconds || this.queue.options?.cleanup?.completed_after_seconds,
          });
        });
      }

      if (this.queue.options?.cleanup?.failedAfterSeconds || this.queue.options?.cleanup?.failed_after_seconds) {
        cron.schedule('*/30 * * * * *', () => {
          handle_cleanup_queues({
            database: db,
            table: `queue_${this.queue.name}`,
            seconds: this.queue.options?.cleanup?.failedAfterSeconds || this.queue.options?.cleanup?.failed_after_seconds,
          });
        });
      }
    }
  },
  log_attempt: function (job_id = '') {
    const db = this?.db;
    return db?.query(`
      UPDATE
        queue_${this.queue.name}
      SET
        attempts = attempts + 1
      WHERE
        _id = $1
    `, [
      job_id,
    ]);
  },
  requeue_job: function (job_id = '', next_run_at = null) {
    const db = this?.db;
    return db?.query(`
      UPDATE
        queue_${this.queue.name}
      SET
        status = $1,
        next_run_at = $2,
        locked_by = $3
      WHERE
        _id = $4
    `, [
      'pending',
      next_run_at,
      null,
      job_id,
    ]);
  },
  set_job_completed: function (job_id = '') {
    const db = this?.db;
    return db?.query(`
      UPDATE
        queue_${this.queue.name}
      SET
        status = $1,
        completed_at = $2
      WHERE
        _id = $3
    `, [
      'completed',
      timestamps.get_current_time(),
      job_id
    ]);
  },
  set_job_failed: function (job_id = '', error = '') {
    const db = this?.db;
    return db?.query(`
      UPDATE
        queue_${this.queue.name}
      SET
        status = $1,
        failed_at = $2,
        error = $3
      WHERE
        _id = $4
    `, [
      'failed',
      timestamps.get_current_time(),
      error,
      job_id,
    ]);
  },
  set_jobs_for_machine_pending: function () {
    const db = this?.db;
    return db?.query(`
      UPDATE
        queue_${this.queue.name}
      SET
        status = $1,
        locked_by = $2
      WHERE
        status = ANY($3)
      AND
        locked_by = $4
    `, [
      'pending',
      null,
      ['pending', 'running'],
      this.machine_id,
    ]);
  },
};

export default queues;

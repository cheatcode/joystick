import dayjs from "dayjs";

export default {
  addJob: function (jobToAdd = {}) {
    const db = process.databases._queues;

    return db?.query(`
      INSERT INTO queue_${this.queue.name} (
        _id,
        status,
        job,
        payload,
        next_run_at
      ) VALUES (
        $1, $2, $3, $4, $5
      )
    `, [
      jobToAdd?._id,
      jobToAdd?.status,
      jobToAdd?.job,
      JSON.stringify(jobToAdd?.payload),
      jobToAdd?.nextRunAt,
    ]);
  },
  countJobs: async function (status = '') {
    const db = process.databases._queues;

    const [jobs] = await db?.query(`
      SELECT
        count(*)
      FROM
        queue_${this.queue.name}
      WHERE
        status = $1
    `, [
      status,
    ]);

    return Promise.resolve(jobs.count);
  },
  deleteJob: function (jobId = '') {
    const db = process.databases._queues;

    return db?.query(`
      DELETE FROM
        queue_${this.queue.name}
      WHERE
        _id = $1
    `, [
      jobId
    ]);
  },
  getJobs: function (query = {}) {
    const db = process.databases._queues;

    return db?.query(`
      SELECT * FROM
        queue_${this.queue.name}
      ${query?.status ? `
        WHERE
          status = $1
      ` : ''}
    `, [
      query?.status,
    ]);
  },
  getNextJobToRun: async function () {
    const db = process.databases._queues;

    const [nextJob] = await db?.query(`
      SELECT * FROM
        queue_${this.queue.name}
      WHERE
        status = $1
      AND
        next_run_at::date <= NOW()
      AND
        locked_by IS NULL
      ORDER BY
        next_run_at ASC
    `, [
      'pending'
    ]);

    if (nextJob?._id) {
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
        dayjs().format(),
        this.machineId,
        nextJob?._id,
      ]);
    }

    return nextJob ? {
      ...nextJob,
      payload: nextJob?.payload ? JSON.parse(nextJob?.payload || '') : {},
    } : {};
  },
  initializeDatabase: async function () {
    const db = process.databases._queues;

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
        error text
      )
    `);

    db?.query(`CREATE INDEX IF NOT EXISTS status_index ON queue_${this.queue.name} (status)`);
    db?.query(`CREATE INDEX IF NOT EXISTS status_nextRunAt_index ON queue_${this.queue.name} (status, next_run_at)`);
    db?.query(`CREATE INDEX IF NOT EXISTS completedAt_index ON queue_${this.queue.name} (completed_at)`);
    db?.query(`CREATE INDEX IF NOT EXISTS failedAt_index ON queue_${this.queue.name} (failed_at)`);
  },
  requeueJob: function (jobId = '', nextRunAt = null) {
    const db = process.databases._queues;
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
      nextRunAt,
      null,
      jobId,
    ]);
  },
  setJobsForMachineIncomplete: function () {
    const db = process.databases._queues;
    return db?.query(`
      UPDATE
        queue_${this.queue.name}
      SET
        status = $1
      WHERE
        status = $2
      AND
        locked_by = $3
    `, [
      'incomplete',
      'running',
      this.machineId,
    ]);
  },
  setJobCompleted: function (jobId = '') {
    const db = process.databases._queues;
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
      dayjs().format(),
      jobId
    ]);
  },
  setJobFailed: function (jobId = '', error = '') {
    const db = process.databases._queues;
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
      dayjs().format(),
      error,
      jobId,
    ]);
  },
  setJobsForMachinePending: function () {
    const db = process.databases._queues;
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
      this.machineId,
    ]);
  },
};
import cron from "node-cron";
import handleCleanupQueues from "../handleCleanupQueues";
var queues_default = {
  addJob: function(jobToAdd = {}) {
    const db = this?.db;
    return db?.query(`
      INSERT INTO queue_${this.queue.name} (
        _id,
        status,
        environment,
        job,
        payload,
        next_run_at,
        attempts
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7
      )
    `, [
      jobToAdd?._id,
      jobToAdd?.status,
      jobToAdd?.environment,
      jobToAdd?.job,
      JSON.stringify(jobToAdd?.payload),
      jobToAdd?.nextRunAt,
      0
    ]);
  },
  countJobs: async function(status = "") {
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
      this.machineId
    ]);
    return Promise.resolve(jobs.count);
  },
  deleteJob: function(jobId = "") {
    const db = this?.db;
    return db?.query(`
      DELETE FROM
        queue_${this.queue.name}
      WHERE
        _id = $1
    `, [
      jobId
    ]);
  },
  deleteIncompleteJobsForMachine: function() {
    const db = this?.db;
    return db?.query(`
      DELETE FROM
        queue_${this.queue.name}
      WHERE
        status = ANY($1)
      AND
        locked_by = $2
    `, [
      ["incomplete", "running"],
      this.machineId
    ]);
  },
  getJobs: function(query = {}) {
    const db = this?.db;
    return db?.query(`
      SELECT * FROM
        queue_${this.queue.name}
      ${query?.status ? `
        WHERE
          status = $1
        AND
          environment = $2
      ` : ""}
    `, [
      query?.status,
      process.env.NODE_ENV
    ]);
  },
  getNextJobToRun: async function() {
    const db = this?.db;
    const [nextJob] = await db?.query(`
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
    `, [
      "pending",
      process.env.NODE_ENV,
      new Date().toISOString()
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
        "running",
        new Date().toISOString(),
        this.machineId,
        nextJob?._id
      ]);
    }
    return nextJob ? {
      ...nextJob,
      payload: nextJob?.payload ? JSON.parse(nextJob?.payload || "") : {}
    } : {};
  },
  initializeDatabase: async function() {
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
        attempts smallint
      )
    `);
    await db?.query(`ALTER TABLE queue_${this.queue.name} ADD COLUMN IF NOT EXISTS environment text`);
    await db?.query(`ALTER TABLE queue_${this.queue.name} ADD COLUMN IF NOT EXISTS attempts smallint`);
    await db?.query(`CREATE INDEX IF NOT EXISTS status_index ON queue_${this.queue.name} (status)`);
    await db?.query(`CREATE INDEX IF NOT EXISTS status_nextRunAt_index ON queue_${this.queue.name} (status, next_run_at)`);
    await db?.query(`CREATE INDEX IF NOT EXISTS nextJob_index ON queue_${this.queue.name} (status, environment, next_run_at, locked_by)`);
    await db?.query(`CREATE INDEX IF NOT EXISTS completedAt_index ON queue_${this.queue.name} (completed_at)`);
    await db?.query(`CREATE INDEX IF NOT EXISTS failedAt_index ON queue_${this.queue.name} (failed_at)`);
    if (this.queue.options?.cleanup?.completedAfterSeconds) {
      cron.schedule("*/30 * * * * *", () => {
        handleCleanupQueues({
          database: db,
          table: `queue_${this.queue.name}`,
          seconds: this.queue.options?.cleanup?.completedAfterSeconds
        });
      });
    }
    if (this.queue.options?.cleanup?.failedAfterSeconds) {
      cron.schedule("*/30 * * * * *", () => {
        handleCleanupQueues({
          database: db,
          table: `queue_${this.queue.name}`,
          seconds: this.queue.options?.cleanup?.failedAfterSeconds
        });
      });
    }
  },
  logAttempt: function(jobId = "") {
    const db = this?.db;
    return db?.query(`
      UPDATE
        queue_${this.queue.name}
      SET
        attempts = attempts + 1
      WHERE
        _id = $1
    `, [
      jobId
    ]);
  },
  requeueJob: function(jobId = "", nextRunAt = null) {
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
      "pending",
      nextRunAt,
      null,
      jobId
    ]);
  },
  setJobCompleted: function(jobId = "") {
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
      "completed",
      new Date().toISOString(),
      jobId
    ]);
  },
  setJobFailed: function(jobId = "", error = "") {
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
      "failed",
      new Date().toISOString(),
      error,
      jobId
    ]);
  },
  setJobsForMachinePending: function() {
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
      "pending",
      null,
      ["pending", "running"],
      this.machineId
    ]);
  }
};
export {
  queues_default as default
};

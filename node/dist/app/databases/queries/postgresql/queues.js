import i from"node-cron";import s from"cluster";import o from"../../postgresql/handle_cleanup_queues.js";import a from"../../../../lib/timestamps.js";import r from"../../../../lib/wait.js";const _={add_job:async function(e={}){const t=this?.db,[u]=await t?.query("SELECT * FROM information_schema.tables WHERE table_name = $1",[`queue_${this.queue.name}`]);u||await r(1);const n=typeof e.next_run_at=="string"?e.next_run_at:e.next_run_at?.toISOString();return t?.query(`
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
    `,[e?._id,e?.status,e?.environment,e?.job,JSON.stringify(e?.payload),n,0])},count_jobs:async function(e=""){const t=this?.db,[u]=await t?.query(`
      SELECT
        count(*)
      FROM
        queue_${this.queue.name}
      WHERE
        status = $1
      AND
        locked_by = $2
    `,[e,this.machine_id]);return Promise.resolve(u.count)},delete_job:function(e=""){return this?.db?.query(`
      DELETE FROM
        queue_${this.queue.name}
      WHERE
        _id = $1
    `,[e])},delete_incomplete_jobs_for_machine:function(){return this?.db?.query(`
      DELETE FROM
        queue_${this.queue.name}
      WHERE
        status = ANY($1)
      AND
        locked_by = $2
    `,[["incomplete","running"],this.machine_id])},get_jobs:function(e={}){return this?.db?.query(`
      SELECT * FROM
        queue_${this.queue.name}
      ${e?.status?`
        WHERE
          status = $1
        AND
          environment = $2
      `:""}
    `,[e?.status,process.env.NODE_ENV])},get_next_job_to_run:async function(){const e=this?.db,t=a.get_database_format(e),u=a.get_current_time({format:t}),[n]=await e?.query(`
      SELECT * FROM
        queue_${this.queue.name}
      WHERE
        status = $1
      AND
        environment = $2
      AND
        next_run_at::timestamp <= $3::timestamp
      AND
        locked_by IS NULL
      ORDER BY
        next_run_at ASC
    `,["pending",process.env.NODE_ENV,u]);return n?._id&&await e?.query(`
        UPDATE
          queue_${this.queue.name}
        SET
          status = $1,
          started_at = $2,
          locked_by = $3
        WHERE
          _id = $4
      `,["running",a.get_current_time({format:"postgresql"}),this.machine_id,n?._id]),n?{...n,payload:n?.payload?JSON.parse(n?.payload||""):{}}:{}},initialize_database:async function(){if(s.isPrimary||s.isWorker&&s.worker.id===1){const e=this?.db;await e?.query(`
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
      `),await e?.query(`ALTER TABLE queue_${this.queue.name} ADD COLUMN IF NOT EXISTS environment text`),await e?.query(`ALTER TABLE queue_${this.queue.name} ADD COLUMN IF NOT EXISTS attempts smallint`),await e?.query(`CREATE INDEX IF NOT EXISTS status_index ON queue_${this.queue.name} (status)`),await e?.query(`CREATE INDEX IF NOT EXISTS status_next_run_at_index ON queue_${this.queue.name} (status, next_run_at)`),await e?.query(`CREATE INDEX IF NOT EXISTS next_job_index ON queue_${this.queue.name} (status, environment, next_run_at, locked_by)`),await e?.query(`CREATE INDEX IF NOT EXISTS completed_at_index ON queue_${this.queue.name} (completed_at)`),await e?.query(`CREATE INDEX IF NOT EXISTS failed_at_index ON queue_${this.queue.name} (failed_at)`),(this.queue.options?.cleanup?.completedAfterSeconds||this.queue.options?.cleanup?.completed_after_seconds)&&i.schedule("*/30 * * * * *",()=>{o({database:e,table:`queue_${this.queue.name}`,seconds:this.queue.options?.cleanup?.completedAfterSeconds||this.queue.options?.cleanup?.completed_after_seconds})}),(this.queue.options?.cleanup?.failedAfterSeconds||this.queue.options?.cleanup?.failed_after_seconds)&&i.schedule("*/30 * * * * *",()=>{o({database:e,table:`queue_${this.queue.name}`,seconds:this.queue.options?.cleanup?.failedAfterSeconds||this.queue.options?.cleanup?.failed_after_seconds})})}},log_attempt:function(e=""){return this?.db?.query(`
      UPDATE
        queue_${this.queue.name}
      SET
        attempts = attempts + 1
      WHERE
        _id = $1
    `,[e])},requeue_job:function(e="",t=null){return this?.db?.query(`
      UPDATE
        queue_${this.queue.name}
      SET
        status = $1,
        next_run_at = $2,
        locked_by = $3
      WHERE
        _id = $4
    `,["pending",t,null,e])},set_job_completed:function(e=""){const t=this?.db;return t?.query(`
      UPDATE
        queue_${this.queue.name}
      SET
        status = $1,
        completed_at = $2
      WHERE
        _id = $3
    `,["completed",a.get_current_time({format:a.get_database_format(t)}),e])},set_job_failed:function(e="",t=""){const u=this?.db;return u?.query(`
      UPDATE
        queue_${this.queue.name}
      SET
        status = $1,
        failed_at = $2,
        error = $3
      WHERE
        _id = $4
    `,["failed",a.get_current_time({format:a.get_database_format(u)}),t,e])},set_jobs_for_machine_pending:function(){return this?.db?.query(`
      UPDATE
        queue_${this.queue.name}
      SET
        status = $1,
        locked_by = $2
      WHERE
        status = ANY($3)
      AND
        locked_by = $4
    `,["pending",null,["pending","running"],this.machine_id])}};var l=_;export{l as default};

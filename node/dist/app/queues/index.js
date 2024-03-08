import d from"chalk";import h from"fs";import c from"os";import b from"../../lib/generate_id.js";import f from"../databases/get_target_database_connection.js";import l from"../databases/queries/map.js";import _ from"../../lib/timestamps.js";import i from"../../lib/types.js";import p from"../../test/track_function_call.js";class m{constructor(e="",t={}){this.init_database=this.init_database.bind(this),this.machine_id=h.readFileSync(`${c.homedir()}/.cheatcode/MACHINE_ID`,"utf-8")?.trim().replace(/\n/g,""),this.name=e,this.options={concurrent_jobs:1,...t},this.init_database(this?.options?.external,this?.options?.database?.provider)}async init_database(e=!1,t=null){const n=t||f("queues")?.provider,s=l[n]?.queues,o=this._get_database_connection();i.is_object(o)&&i.is_object(s)&&(this.db=Object.entries(s||{})?.reduce((a={},[r,u])=>(a[r]=u.bind({db:o,machine_id:this.machine_id,queue:{name:this.name,options:this.options}}),a),{_connection:o}),e||(await this.db.initialize_database(n),(this?.options?.runOnStartup||this?.options?.run_on_startup)&&this.run()))}_get_database_connection(){if(this?.options?.database){const{provider:e,name:t}=this?.options?.database,n=process.databases&&process.databases[e]&&process.databases[e][t];return n||console.warn(d.red(`Connection to database ${e}.${t} not found on process. Cannot start queue.`)),n||null}return process.databases._queues}async add(e={}){const t=(e?.nextRunAt||e?.next_run_at)==="now"||!e?.nextRunAt&&!e?.next_run_at?_.get_future_time():e?.nextRunAt||e?.next_run_at,n={_id:b(16),status:"pending",environment:process.env.NODE_ENV,next_run_at:t,job:e?.job,payload:e?.payload},s=this?.options?.jobs&&this?.options?.jobs[e?.job];if(s&&(i.is_function(s?.preflight?.onBeforeAdd)||i.is_function(s?.preflight?.on_before_add))&&!await(s?.preflight?.onBeforeAdd||s?.preflight?.on_before_add)(n,this.db._connection,`queue_${this.name}`))return null;this.db.add_job(n)}async _check_if_okay_to_run_jobs(){return await this._get_number_of_jobs_running()<(this.options.concurrentJobs||this.options.concurrent_jobs||1)}_get_number_of_jobs_running(){return this.db.count_jobs("running")}_handle_requeue_jobs_running_before_restart(){if(this.db)return!this.options.retryJobsRunningBeforeRestart&&!this.options.retry_jobs_running_before_restart?this.db.delete_incomplete_jobs_for_machine():this.db.set_jobs_for_machine_pending()}run(){this.db&&(process.env.NODE_ENV!=="test"&&console.log(`Starting ${this.name} queue...`),this._handle_requeue_jobs_running_before_restart().then(()=>{setInterval(async()=>{if(await this._check_if_okay_to_run_jobs()&&!process.env.HALT_QUEUES){const t=await this.db.get_next_job_to_run();this.handle_next_job(t)}},300)}))}async handle_next_job(e={}){const t=this.options.jobs[e?.job];if(e&&e?.job&&t&&i.is_function(t?.run))try{if((i.is_function(t?.preflight?.okayToRun)||i.is_function(t?.preflight?.okay_to_run))&&!await(t?.preflight?.okayToRun||t?.preflight?.okay_to_run)(e?.payload,e))return this._handle_requeue_job(e,_.get_future_time("seconds",t?.preflight?.requeueDelayInSeconds||t?.preflight?.requeue_delay_in_seconds||10));if((i.is_number(t?.maxAttempts)||i.is_number(t?.max_attempts))&&e?.attempts>=parseInt(t?.maxAttempts||t?.max_attempts,10))return(i.is_function(t?.onMaxAttemptsExhausted)||i.is_function(t?.on_max_attempts_exhausted))&&await(t.onMaxAttemptsExhausted||t.on_max_attempts_exhausted)(e),this._handle_delete_job(e?._id);await this._log_attempt(e?._id),p(`node.queues.${this?.name}.jobs.${e?.job}`,[e?.payload]),await t.run(e?.payload,{...e,queue:this,completed:()=>this._handle_job_completed(e?._id),failed:n=>this._handle_job_failed(e,t,n),delete:()=>this._handle_delete_job(e?._id),requeue:(n="")=>this._handle_requeue_job(e,n)})}catch(n){console.warn(n),this._handle_job_failed(e,t,n)}}_log_attempt(e=""){return this.db.log_attempt(e)}_handle_job_completed(e=""){return this.db.set_job_completed(e)}_handle_job_failed(e={},t={},n=""){return t?.requeueOnFailure||t?.requeue_on_failure?this._handle_requeue_job(e,_.get_future_time("seconds",10)):this.db.set_job_failed(e?._id,n)}_handle_delete_job(e=""){return this.db.delete_job(e)}_handle_requeue_job(e={},t=null){return this.db.requeue_job(e?._id,t||_.get_future_time())}list(e=""){const t={};return e&&(t.status=e),this.db.get_jobs(t)}}var R=m;export{R as default};

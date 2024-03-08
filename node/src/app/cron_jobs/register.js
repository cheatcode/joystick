import cron from 'node-cron';
import types from "../../lib/types.js";

const register = (cron_jobs = {}) => {
  if (types.is_object(cron_jobs)) {
    const cron_job_definitions = Object.entries(cron_jobs || {});
    for (let i = 0; i < cron_job_definitions.length; i += 1) {
      const [cron_job_name, cron_job_options] = cron_job_definitions[i];
      if (cron_job_options?.schedule && cron_job_options?.run && types.is_function(cron_job_options?.run)
      ) {
        process.cron = {
          ...(process.queues || {}),
          [cron_job_name]: cron.schedule(cron_job_options?.schedule, () => {
            if (
              (cron_job_options?.logAtRunTime && types.is_string(cron_job_options?.logAtRunTime)) ||
              (cron_job_options?.log_at_run_time && types.is_string(cron_job_options?.log_at_run_time))
            ) {
              console.log(cron_job_options.logAtRunTime || cron_job_options?.log_at_run_time);
            }

            cron_job_options.run();
          }),
        };
      }
    }
  }
};

export default register;

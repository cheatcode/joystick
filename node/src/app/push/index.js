import fs from 'fs';
import { NODE_CRON_EVERY_MINUTE, NODE_CRON_EVERY_TEN_SECONDS, NODE_CRON_EVERY_THIRTY_SECONDS } from "../../lib/constants.js";
import path_exists from "../../lib/path_exists.js";
import send_instance_data_to_push from './send_instance_data_to_push.js';
import snapshot_metrics from './snapshot_metrics.js';

const { readFile } = fs.promises;

const get_logs = async () => {
  const logs_path = '/root/push/logs/app.log';
  const has_logs = await path_exists(logs_path);

  if (!has_logs) {
    return '';
  }

  return readFile(logs_path, 'utf-8');
};

const push = () => {
  const sync_logs_job = cron.schedule(NODE_CRON_EVERY_TEN_SECONDS, async () => {
    const logs = await get_logs();
    send_instance_data_to_push('logs', logs);
  });

  const sync_metrics_job = cron.schedule(NODE_CRON_EVERY_THIRTY_SECONDS, () => {
    const metrics = snapshot_metrics();
    send_instance_data_to_push('metrics', metrics);
  });

  const health_check_job = cron.schedule(NODE_CRON_EVERY_MINUTE, () => {
    send_instance_data_to_push('health-checks');
  });

  sync_logs_job.start();
  sync_metrics_job.start();
  health_check_job.start();
};

export default push;

import fs from 'fs';
import cron from 'node-cron';
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
    try {
      const logs = await get_logs();
      send_instance_data_to_push('logs', logs);
    } catch (exception) {
      console.warn('sync_logs_job', exception);
    }    
  });

  const sync_metrics_job = cron.schedule(NODE_CRON_EVERY_THIRTY_SECONDS, async () => {
    try {
      const metrics = await snapshot_metrics();
      send_instance_data_to_push('metrics', metrics);
    } catch (exception) {
      console.warn('sync_metrics_job', exception);
    }
  });

  const health_check_job = cron.schedule(NODE_CRON_EVERY_MINUTE, () => {
    try {
      send_instance_data_to_push('health-checks');
    } catch (exception) {
      console.warn('health_check_job', exception);
    }
  });

  sync_logs_job.start();
  sync_metrics_job.start();
  health_check_job.start();
};

export default push;

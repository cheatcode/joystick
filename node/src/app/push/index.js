import cron from 'node-cron';
import { NODE_CRON_EVERY_TEN_SECONDS, NODE_CRON_EVERY_THIRTY_SECONDS } from "../../lib/constants.js";
// import send_instance_data_to_push from './send_instance_data_to_push.js';
import snapshot_metrics from './snapshot_metrics.js';

const push = () => {
  const sync_metrics_job = cron.schedule(NODE_CRON_EVERY_TEN_SECONDS, async () => {
    try {
      const metrics = await snapshot_metrics();
      
      process.push_instances_websocket.send({
        headers: { 'x-push-instance-token': process.env.PUSH_INSTANCE_TOKEN },
        type: 'metrics',
        metrics,
      });
    } catch (exception) {
      console.warn('sync_metrics_job', exception);
    }
  });

  sync_metrics_job.start();
};

export default push;

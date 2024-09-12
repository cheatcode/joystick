import types from "../../lib/types.js";
import cluster from 'cluster';

const emit_event = (emitter_id = '', event_name = '', payload = {}) => {
  if (cluster.isPrimary) {
    // In the primary process, we need to send the event to all workers
    for (const id in cluster.workers) {
      cluster.workers[id].send({
        type: 'websocket_event',
        emitter_id,
        event_name,
        payload
      });
    }
  }

  // Emit locally (this works for both primary and worker processes)
  const emitters = joystick?.emitters[emitter_id];

  if (types.is_array(emitters)) {
    for (let i = 0; i < emitters?.length; i += 1) {
      const emitter_recipient = emitters[i];
      emitter_recipient.emit(event_name, payload);
    }
  }
};

export default emit_event;
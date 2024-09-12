import types from "../../lib/types.js";
import cluster from 'cluster';

const emit_event = (emitter_id = '', event_name = '', payload = {}) => {
  const message = {
    type: 'websocket',
    emitter_name: emitter_id,
    event: event_name,
    payload
  };

  if (cluster.isPrimary) {
    // If in primary process, handle the message directly
    if (typeof global.handle_websocket_message === 'function') {
      global.handle_websocket_message(message);
    }
  } else {
    // If in worker process, send the message to the primary
    process.send(message);
  }

  // Also emit locally
  const emitters = joystick?.emitters[emitter_id];
  if (types.is_array(emitters)) {
    for (let i = 0; i < emitters?.length; i += 1) {
      const emitter_recipient = emitters[i];
      emitter_recipient.emit(event_name, payload);
    }
  }
};

export default emit_event;
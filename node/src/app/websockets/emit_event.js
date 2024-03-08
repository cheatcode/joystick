import types from "../../lib/types.js";

const emit_event = (emitter_id = '', event_name = '', payload = {}) => {
  const emitters = joystick?.emitters[emitter_id];

  if (types.is_array(emitters)) {
    for (let i = 0; i < emitters?.length; i += 1) {
      const emitter_recipient = emitters[i];
      emitter_recipient.emit(event_name, payload);
    }
  }
};

export default emit_event;

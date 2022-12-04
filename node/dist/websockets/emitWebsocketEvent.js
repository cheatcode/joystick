var emitWebsocketEvent_default = (emitterId = "", eventName = "", payload = {}) => {
  const emitter = joystick?.emitters[emitterId];
  if (emitter && Array.isArray(emitter)) {
    for (let i = 0; i < emitter?.length; i += 1) {
      const emitterRecipient = emitter[i];
      emitterRecipient.emit(eventName, payload);
    }
  }
};
export {
  emitWebsocketEvent_default as default
};

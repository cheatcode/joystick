import emitWebsocketEvent from "./emitWebsocketEvent";

export default (serverName = '') => {
  return {
    send: (payload = {}, uniqueConnectionId = '') => {
      const emitterName = uniqueConnectionId ? `${serverName}_${uniqueConnectionId}` : serverName;
      emitWebsocketEvent(emitterName, 'message', payload);
    },
  };
};
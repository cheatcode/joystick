import emitWebsocketEvent from "./emitWebsocketEvent";
var websockets_default = (serverName = "") => {
  return {
    send: (payload = {}, uniqueConnectionId = "") => {
      const emitterName = uniqueConnectionId ? `${serverName}_${uniqueConnectionId}` : serverName;
      emitWebsocketEvent(emitterName, "message", payload);
    }
  };
};
export {
  websockets_default as default
};

import emitWebsocketEvent from "./emitWebsocketEvent";
import trackFunctionCall from "../test/trackFunctionCall.js";
var websockets_default = (serverName = "") => {
  return {
    send: (payload = {}, uniqueConnectionId = "") => {
      const emitterName = uniqueConnectionId ? `${serverName}_${uniqueConnectionId}` : serverName;
      trackFunctionCall(`node.websockets.${serverName}.send`, [
        payload
      ]);
      emitWebsocketEvent(emitterName, "message", payload);
    }
  };
};
export {
  websockets_default as default
};

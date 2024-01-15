import emitWebsocketEvent from "./emitWebsocketEvent";
import trackFunctionCall from "../test/trackFunctionCall.js";

export default (serverName = '') => {
  return {
    send: (payload = {}, uniqueConnectionId = '') => {
      const emitterName = uniqueConnectionId ? `${serverName}_${uniqueConnectionId}` : serverName;
      emitWebsocketEvent(emitterName, 'message', payload);
      trackFunctionCall(`node.websockets.${serverName}.send`, [
        payload
      ]);
    },
  };
};
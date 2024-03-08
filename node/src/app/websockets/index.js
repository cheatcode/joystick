import emit_websocket_event from "./emit_event.js";
import track_function_call from "../../test/track_function_call.js";

const websockets = (server_name = '') => {
  return {
    send: (payload = {}, unique_connection_id = '') => {
      const emitter_name = unique_connection_id ? `${server_name}_${unique_connection_id}` : server_name;
      emit_websocket_event(emitter_name, 'message', payload);
      track_function_call(`node.websockets.${server_name}.send`, [
        payload
      ]);
    },
  };
};

export default websockets;

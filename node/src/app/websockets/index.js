import track_function_call from "../../test/track_function_call.js";
import cluster from "cluster";

const websockets = (server_name = '') => {
  return {
    send: (payload = {}, unique_connection_id = '') => {
      const emitter_name = unique_connection_id ? `${server_name}_${unique_connection_id}` : server_name;
      
      const message = {
        type: 'websocket',
        emitter_name,
        event: 'message',
        payload
      };

      if (cluster.isPrimary) {
        if (typeof global.handle_websocket_message === 'function') {
          global.handle_websocket_message(message);
        }
      } else {
        process.send(message);
      }

      track_function_call(`node.websockets.${server_name}.send`, [
        payload
      ]);
    },
  };
};

export default websockets;
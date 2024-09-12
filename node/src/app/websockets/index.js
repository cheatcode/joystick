import track_function_call from "../../test/track_function_call.js";
import { share_message_across_cluster } from "./register.js";

const websockets = (server_name = '') => {
  return {
    send: (payload = {}, unique_connection_id = '') => {
      const emitter_name = unique_connection_id ? `${server_name}_${unique_connection_id}` : server_name;
      
      // Use the cluster-aware sharing function
      share_message_across_cluster({
        emitter_name,
        event: 'message',
        payload
      });

      track_function_call(`node.websockets.${server_name}.send`, [
        payload
      ]);
    },
  };
};

export default websockets;
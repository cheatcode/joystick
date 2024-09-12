import EventEmitter from "events";
import queryString from 'query-string';
import * as WebSocket from "ws";
import track_function_call from "../../test/track_function_call.js";
import types from "../../lib/types.js";
import cluster from 'cluster';

const websocket_servers = {};

const handle_websocket_connection_upgrade = (express_server = {}, websocket_servers = {}) => {
  express_server.on('upgrade', (request, socket, head) => {
    if (request?.url?.includes('/api/_websockets')) {
      const websocket_name = (request?.url?.replace('/api/_websockets/', '')?.split('?') || [])[0];
      const websocket_definition = websocket_servers[websocket_name];

      if (websocket_definition) {
        websocket_definition.server.handleUpgrade(request, socket, head, (socket) => {
          websocket_definition.server.emit('connection', socket, request);
        });
      }
    }
  });
};

const handle_websocket_connection_events = (websocket_connection = {}, connection_params = {}, websocket_definition = {}) => {
  const connection = Object.assign(websocket_connection, { params: connection_params });

  if (types.is_function(websocket_definition?.onOpen) || types.is_function(websocket_definition?.on_open)) {
    (websocket_definition?.onOpen || websocket_definition?.on_open)(connection);
  }

  websocket_connection.on("message", (message) => {
    const message_as_json = JSON.parse(message);
    console.log(`[Process ${process.pid}] Received message:`, message_as_json);

    if (types.is_function(websocket_definition?.on_message)) {
      websocket_definition?.on_message(message_as_json, websocket_connection);
    }

    share_message_across_cluster(message_as_json);
  });

  websocket_connection.on("close", (code = 0, reason = "") => {
    if (types.is_function(websocket_definition?.on_close)) {
      websocket_definition?.on_close(code, reason?.toString(), websocket_connection);
    }
  });
};

const register_websocket_event_emitter = (websocket_name = '', connection_params = {}, websocket_connection = {}) => {
  const emitter = new EventEmitter();
  const emitter_id = connection_params?.id ? `${websocket_name}_${connection_params?.id}` : websocket_name;

  if (joystick?.emitters && joystick?.emitters[emitter_id]) {
    joystick.emitters[emitter_id].push(emitter);
  } else {
    joystick.emitters = {
      ...(joystick?.emitters || {}),
      [emitter_id]: [emitter],
    };
  }

  emitter.on("message", (message = {}) => {
    websocket_connection.send(JSON.stringify(message));
  });

  emitter.on("progress", (progress = {}) => {
    websocket_connection.send(
      JSON.stringify({ type: "PROGRESS", ...progress })
    );
  });
};

const get_websocket_connection_params = (websocket_connection_request = {}) => {
  const [_path, params] = websocket_connection_request?.url?.split("?");
  return queryString.parse(params);
};

const handle_websocket_connection = (websocket_name = '', websocket_definition = {}) => {
  websocket_definition?.server.on('connection', (websocket_connection = {}, websocket_connection_request = {}) => {
    const connection_params = get_websocket_connection_params(websocket_connection_request);
    register_websocket_event_emitter(websocket_name, connection_params, websocket_connection);
    handle_websocket_connection_events(websocket_connection, connection_params, websocket_definition);
  });
};

const handle_on_close_event = (user_websocket_name = '', user_websocket_definition = {}, websocket_event_args = []) => {
  track_function_call(`node.websockets.${user_websocket_name}.on_close`, websocket_event_args);
  return (user_websocket_definition?.onClose || user_websocket_definition?.on_close) ?
    (user_websocket_definition?.onClose || user_websocket_definition?.on_close)(...websocket_event_args) :
    null;
};

const handle_on_message_event = (user_websocket_name = '', user_websocket_definition = {}, websocket_event_args = []) => {
  track_function_call(`node.websockets.${user_websocket_name}.on_message`, websocket_event_args);
  return (user_websocket_definition?.onMessage || user_websocket_definition?.on_message) ?
    (user_websocket_definition?.onMessage || user_websocket_definition?.on_message)(...websocket_event_args) :
    null;
};

const handle_on_open_event = (user_websocket_name = '', user_websocket_definition = {}, websocket_event_args = []) => {
  track_function_call(`node.websockets.${user_websocket_name}.on_open`, websocket_event_args);
  return (user_websocket_definition?.onOpen || user_websocket_definition?.on_open) ?
    (user_websocket_definition?.onOpen || user_websocket_definition?.on_open)(...websocket_event_args) :
    null;
};

const get_websocket_server = (websocket_name = '') => {
  return new WebSocket.WebSocketServer({
    noServer: true,
    path: `/api/_websockets/${websocket_name}`,
  });
};

const get_websocket_servers = (user_websocket_definitions = {}) => {
  return {
    uploaders: {
      server: get_websocket_server('uploaders'),
    },
    ...Object.entries(user_websocket_definitions || {}).reduce(
      (websockets_to_define = {}, [user_websocket_name, user_websocket_definition]) => {
        websockets_to_define[user_websocket_name] = {
          server: get_websocket_server(user_websocket_name),
          on_open: (...websocket_event_args) => handle_on_open_event(
            user_websocket_name,
            user_websocket_definition,
            websocket_event_args,
          ),
          onOpen: (...websocket_event_args) => handle_on_open_event(
            user_websocket_name,
            user_websocket_definition,
            websocket_event_args,
          ),
          on_message: (...websocket_event_args) => handle_on_message_event(
            user_websocket_name,
            user_websocket_definition,
            websocket_event_args,
          ),
          onMessage: (...websocket_event_args) => handle_on_message_event(
            user_websocket_name,
            user_websocket_definition,
            websocket_event_args,
          ),
          on_close: (...websocket_event_args) => handle_on_close_event(
            user_websocket_name,
            user_websocket_definition,
            websocket_event_args,
          ),
          onClose: (...websocket_event_args) => handle_on_close_event(
            user_websocket_name,
            user_websocket_definition,
            websocket_event_args,
          ),
        };

        return websockets_to_define;
      },
      {}
    ),
  };
};

const share_message_across_cluster = (message, emitter_name = null) => {
  console.log(`[Process ${process.pid}] Sharing message across cluster:`, message);
  const wrapped_message = { message, emitter_name };
  if (cluster.isPrimary) {
    // Primary process: share with all workers
    for (const id in cluster.workers) {
      console.log(`[Primary ${process.pid}] Sending message to worker ${id}`);
      cluster.workers[id].send({ type: 'websocket_message', wrapped_message });
    }
    // Also handle locally
    handle_shared_message(wrapped_message);
  } else {
    // Worker process: send to primary
    console.log(`[Worker ${process.pid}] Sending message to primary`);
    process.send({ type: 'websocket_message', wrapped_message });
  }
};

const handle_shared_message = (wrapped_message) => {
  console.log(`[Process ${process.pid}] Handling shared message:`, wrapped_message);
  const { message, emitter_name } = wrapped_message;
  
  // Send to all connected WebSocket clients
  Object.values(websocket_servers).forEach(({ server }) => {
    server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        console.log(`[Process ${process.pid}] Sending message to client`);
        // Send the message as-is
        client.send(JSON.stringify(message));
      }
    });
  });

  // Also emit to any registered emitters if emitter_name is provided
  if (emitter_name) {
    const emitters = joystick?.emitters[emitter_name];
    if (types.is_array(emitters)) {
      console.log(`[Process ${process.pid}] Found ${emitters.length} emitters for ${emitter_name}`);
      for (let i = 0; i < emitters?.length; i += 1) {
        const emitter_recipient = emitters[i];
        console.log(`[Process ${process.pid}] Emitting message to emitter ${i}`);
        emitter_recipient.emit('message', message);
      }
    } else {
      console.log(`[Process ${process.pid}] No emitters found for ${emitter_name}`);
    }
  }
};

const register = (user_websocket_definitions = {}, app_instance = {}) => {
  console.log(`[Process ${process.pid}] Registering WebSocket servers`);
  const websocket_servers_to_create = get_websocket_servers(user_websocket_definitions);
  Object.assign(websocket_servers, websocket_servers_to_create);
  const websocket_server_entries = Object.entries(websocket_servers);

  for (let i = 0; i < websocket_server_entries?.length; i += 1) {
    const [websocket_name, websocket_definition] = websocket_server_entries[i];
    handle_websocket_connection(websocket_name, websocket_definition);
  }

  handle_websocket_connection_upgrade(app_instance.express.server, websocket_servers);

  if (cluster.isPrimary) {
    console.log(`[Primary ${process.pid}] Setting up message handling for primary`);
    // Primary process: listen for messages from workers
    cluster.on('message', (worker, msg) => {
      if (msg.type === 'websocket_message') {
        console.log(`[Primary ${process.pid}] Received message from worker ${worker.id}:`, msg.wrapped_message);
        // Broadcast to all workers (including the sender)
        share_message_across_cluster(msg.wrapped_message.message, msg.wrapped_message.emitter_name);
      }
    });
  } else {
    console.log(`[Worker ${process.pid}] Setting up message handling for worker`);
    // Worker process: listen for messages from primary
    process.on('message', (msg) => {
      if (msg.type === 'websocket_message') {
        console.log(`[Worker ${process.pid}] Received message from primary:`, msg.wrapped_message);
        handle_shared_message(msg.wrapped_message);
      }
    });
  }
};

export { share_message_across_cluster };
export default register;
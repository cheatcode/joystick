import EventEmitter from "events";
import queryString from 'query-string';
import * as WebSocket from "ws";
import track_function_call from "../../test/track_function_call.js";
import types from "../../lib/types.js";

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

  // NOTE: This is a message being sent inbound by the client.
  websocket_connection.on("message", (message) => {
    const message_as_json = JSON.parse(message);

    if (types.is_function(websocket_definition?.on_message)) {
    	websocket_definition?.on_message(message_as_json, websocket_connection);
  	}
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

  // NOTE: This is a message being sent outbound by the server. This is already contextualized
  // to a unique ID (if applicable) via the joystick.emitters.<emitterId> pattern above.
  emitter.on("message", (message = {}) => {
    websocket_connection.send(JSON.stringify(message));
  });

  // NOTE: This is an internal emitter for handling progress events via uploaders.
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

const register = (user_websocket_definitions = {}, app_instance = {}) => {
	const websocket_servers_to_create = get_websocket_servers(user_websocket_definitions);
	const websocket_servers = Object.entries(websocket_servers_to_create);

	for (let i = 0; i < websocket_servers?.length; i += 1) {
		const [websocket_name, websocket_definition] = websocket_servers[i];
		handle_websocket_connection(websocket_name, websocket_definition);
	}

	// NOTE: Doing this here is intentional. Because the upgrade emits a connection event,
  // the connection event handler must be defined first (what we're doing above).
  handle_websocket_connection_upgrade(app_instance.express.server, websocket_servers_to_create);
};

export default register;

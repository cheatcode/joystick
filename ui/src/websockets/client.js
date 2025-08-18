import generate_id from "../lib/generate_id.js";
import track_function_call from "../test/track_function_call.js";

let reconnect_interval = null;
let reconnect_attempts = 0;

const websocket_client = (options = {}, on_connect = null) => {
  if (window?.__joystick_test__) {
    // NOTE: Skip connection in test environment and fire the on_connect callback.
    return on_connect();
  }

  let url = options?.url;

  if (options?.query) {
    url = `${url}?${new URLSearchParams(options.query).toString()}`;
  }

  let client = new WebSocket(url);

  if (reconnect_interval) {
    clearInterval(reconnect_interval);
    reconnect_interval = null;
  }

  const on_open_handler = () => {
    if (options?.options?.logging) {
      console.log(`[joystick.websockets] Connected to ${options?.url}`);
    }

    if (options?.events?.onOpen || options?.events?.on_open) {
      (options.events.onOpen || options.events.on_open)(connection);
      track_function_call(`ui.websockets.${options?.test?.name || generate_id()}.on_open`, [
        connection
      ]);
    }

    reconnect_attempts = 0;
  };

  const on_message_handler = (event) => {
    if (event?.data && (options?.events?.onMessage || options?.events?.on_message)) {
      (options.events.onMessage || options.events.on_message)(JSON.parse(event.data || {}), connection);
      track_function_call(`ui.websockets.${options?.test?.name || generate_id()}.on_message`, [
        event.data || {},
        connection
      ]);
    }
  };

  const on_close_handler = (event) => {
    if (options?.options?.logging) {
      console.log(`[joystick.websockets] Disconnected from ${options?.url}`);
    }

    if (options?.events?.onClose || options?.events?.on_close) {
      (options.events.onClose || options.events.on_close)(event?.code, event?.reason, connection);
      track_function_call(`ui.websockets.${options?.test?.name || generate_id()}.on_close`, [
        event.data || {},
        connection
      ]);
    }

    client = null;

    const was_intentional_close = [1000, 1001]?.includes(event?.code);

    if (window.joystick._internal.websockets) {
      for (const [component_id, sockets_by_name] of Object.entries(window.joystick._internal.websockets)) {
        for (const [websocket_name, socket] of Object.entries(sockets_by_name)) {
          if (socket?._id === connection?._id) {
            delete window.joystick._internal.websockets[component_id][websocket_name];
    
            if (Object.keys(window.joystick._internal.websockets[component_id]).length === 0) {
              delete window.joystick._internal.websockets[component_id];
            }
          }
        }
      }
    }

    if ((options?.options?.autoReconnect || options?.options?.auto_reconnect) && !reconnect_interval && !was_intentional_close) {
      reconnect_interval = setInterval(() => {
        client = null;

        if (reconnect_attempts < (options?.options?.reconnectAttempts || options?.options?.reconnect_attempts || 12)) {
          websocket_client(options, on_connect);

          if (options?.options?.logging) {
            console.log(
              `[joystick.websockets] Attempting to reconnect (${
                reconnect_attempts + 1
              }/12)...`
            );
          }

          reconnect_attempts += 1;
        } else {
          clearInterval(reconnect_interval);
        }
      }, (((options?.options?.reconnectDelayInSeconds || options?.options?.reconnect_delay_in_seconds) * 1000) || 5000));
    }
  };

  const connection = {
    _id: generate_id(8),
    client,
    _event_handlers: {
      on_open: on_open_handler,
      on_message: on_message_handler,
      on_close: on_close_handler,
    },
    send: (message = {}) => {
      track_function_call(`ui.${options?.test?.name || generate_id(16)}.websockets.send`, [
        message
      ]);

      return client.send(JSON.stringify(message));
    },
    cleanup: () => {
      if (client) {
        client.removeEventListener("open", on_open_handler);
        client.removeEventListener("message", on_message_handler);
        client.removeEventListener("close", on_close_handler);
      }
    },
  };

  client.addEventListener("open", on_open_handler);
  client.addEventListener("message", on_message_handler);
  client.addEventListener("close", on_close_handler);

  if (on_connect) on_connect(connection);

  if (window.joystick?._internal) {
    window.joystick._internal.websockets = {
      ...(window?.joystick?._internal?.websockets || {}),
      [options?.component_instance?.id]: {
        ...(window?.joystick?._internal?.websockets?.[options?.component_instance?.id] || {}),
        [options?.name]: connection,
      },
    };
  }

  return connection;
};

export default websocket_client;

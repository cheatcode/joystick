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

  const connection = {
    _id: generate_id(8),
    client,
    send: (message = {}) => {
      track_function_call(`ui.${options?.test?.name || generate_id(16)}.websockets.send`, [
        message
      ]);

      return client.send(JSON.stringify(message));
    },
  };

  client.addEventListener("open", () => {
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
  });

  client.addEventListener("message", (event) => {
    if (event?.data && (options?.events?.onMessage || options?.events?.on_message)) {
      (options.events.onMessage || options.events.on_message)(JSON.parse(event.data || {}), connection);
      track_function_call(`ui.websockets.${options?.test?.name || generate_id()}.on_message`, [
        event.data || {},
        connection
      ]);
    }
  });

  client.addEventListener("close", (event) => {
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

    // NOTE: An intentional close refers to a close that was initiated by the user (refresh),
    // or, a close that was terminated purposefully by the server. An unintentional close
    // would be a server going down/restarting or not responding properly.
    const was_intentional_close = [1000, 1001]?.includes(event?.code);

    if (window.joystick._internal.websockets) {
      window.joystick._internal.websockets = window.joystick._internal.websockets?.filter((existing_websocket) => {
        return existing_websocket?._id !== connection?._id;
      });
    }

    if ((options?.options?.autoReconnect || options?.options?.auto_reconnect) && !reconnect_interval && !was_intentional_close) {
      reconnect_interval = setInterval(() => {
        client = null;

        // NOTE: 12 attempts === try to reconnect for up to 1 minute (12 * 5 seconds between each attempt).
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
  });

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
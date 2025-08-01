import WebSocket from 'ws';
import generate_id from './generate_id.js';

const websocket_client = (options = {}, on_connect = null) => {
  const {
    url: base_url,
    query,
    options: {
      logging = false,
      auto_reconnect = true,
      reconnect_attempts = 12,
      reconnect_delay_in_seconds = 5,
      max_sends_per_second = 20
    } = {},
    events = {}
  } = options;

  const query_string = query ? `?${new URLSearchParams(query).toString()}` : '';
  const full_url = `${base_url}${query_string}`;

  let reconnect_attempts_count = 0;
  let reconnect_interval = null;
  let message_queue = [];
  let send_timestamps = [];

  const connect = () => {
    const client = new WebSocket(full_url);

    const connection = {
      _id: generate_id(8),
      client,
      send: (message = {}) => {
        const now = Date.now();
        send_timestamps = send_timestamps.filter((ts) => now - ts < 1000);

        const should_throttle = send_timestamps.length >= max_sends_per_second;

        if (client?.readyState === WebSocket.OPEN && !should_throttle) {
          try {
            client.send(JSON.stringify(message));
            send_timestamps.push(now);
          } catch (error) {
            if (logging) {
              console.error(`[websockets] Failed to send message:`, message, error);
            }
          }
        } else {
          message_queue.push(message);
          if (logging && should_throttle) {
            console.warn(`[websockets] Throttled message (rate limit hit):`, message);
          } else if (logging) {
            console.warn(`[websockets] Queued message (socket not open):`, message);
          }
        }
      }
    };

    const cleanup = () => {
      client.removeAllListeners();
      if (reconnect_interval) {
        clearInterval(reconnect_interval);
        reconnect_interval = null;
      }
    };

    client.on('open', () => {
      if (logging) {
        console.log(`[websockets] Connected to ${base_url}`);
      }

      (events.on_open)?.(connection);
      reconnect_attempts_count = 0;
      if (on_connect) on_connect(connection);

      if (message_queue.length > 0) {
        if (logging) {
          console.log(`[websockets] Flushing ${message_queue.length} queued message(s)...`);
        }

        const now = Date.now();
        message_queue.forEach((message) => {
          send_timestamps = send_timestamps.filter((ts) => now - ts < 1000);

          if (send_timestamps.length < max_sends_per_second) {
            try {
              client.send(JSON.stringify(message));
              send_timestamps.push(Date.now());
            } catch (error) {
              if (logging) {
                console.error(`[websockets] Failed to send queued message:`, message, error);
              }
            }
          } else if (logging) {
            console.warn(`[websockets] Dropped queued message (throttled):`, message);
          }
        });

        message_queue = [];
      }
    });

    client.on('message', (data) => {
      const parsed = typeof data === 'string' ? JSON.parse(data) : {};
      (events.on_message)?.(parsed, connection);
    });

    client.on('error', (error) => {
      if (logging) {
        console.error(`[websockets] Error from ${base_url}`, error);
      }

      cleanup();
      (events.on_error)?.(error, connection);
    });

    client.on('close', (code, reason) => {
      cleanup();

      if (logging) {
        console.log(`[websockets] Disconnected from ${base_url}`);
      }

      (events.on_close)?.(code, reason, connection);

      const was_intentional = [1000, 1001].includes(code);

      if (auto_reconnect && !was_intentional && !reconnect_interval) {
        reconnect_interval = setInterval(() => {
          const should_retry =
            reconnect_attempts === Infinity || reconnect_attempts_count < reconnect_attempts;

          if (should_retry) {
            reconnect_attempts_count += 1;

            if (logging) {
              console.log(
                `[websockets] Attempting to reconnect (${reconnect_attempts_count}${
                  reconnect_attempts === Infinity ? '' : `/${reconnect_attempts}`
                })...`
              );
            }

            cleanup();
            connect();
          } else {
            clearInterval(reconnect_interval);
            reconnect_interval = null;
          }
        }, Math.min((reconnect_delay_in_seconds * 1000) * Math.pow(2, reconnect_attempts_count), 30000));
      }
    });

    process.once('SIGINT', () => client.close(1000));
    process.once('SIGTERM', () => client.close(1000));

    return connection;
  };

  return connect();
};

export default websocket_client;

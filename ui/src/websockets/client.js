import queryString from "query-string";

let reconnectInterval = null;
let reconnectAttempts = 0;

const websocketClient = (options = {}, onConnect = null) => {
  let url = options?.url;

  if (options.queryParams) {
    url = `${url}?${queryString.stringify(options.queryParams)}`;
  }

  let client = new WebSocket(url);

  if (reconnectInterval) {
    clearInterval(reconnectInterval);
    reconnectInterval = null;
  }

  client.addEventListener("open", () => {
    if (options?.logging) {
      console.log(`[websockets] Connected to ${options?.url}`);
    }

    reconnectAttempts = 0;
  });

  client.addEventListener("message", (event) => {
    if (event?.data && options.onMessage) {
      options.onMessage(JSON.parse(event.data));
    }
  });

  client.addEventListener("close", () => {
    if (options?.logging) {
      console.log(`[websockets] Disconnected from ${options?.url}`);
    }

    client = null;

    if (options.autoReconnect && !reconnectInterval) {
      reconnectInterval = setInterval(() => {
        client = null;

        // NOTE: 12 attempts === try to reconnect for up to 1 minute (12 * 5 seconds between each attempt).
        if (reconnectAttempts < 12) {
          websocketClient(options, onConnect);

          if (options?.logging) {
            console.log(
              `[websockets] Attempting to reconnect (${
                reconnectAttempts + 1
              }/12)...`
            );
          }

          reconnectAttempts += 1;
        } else {
          clearInterval(reconnectInterval);
        }
      }, 5000);
    }
  });

  const connection = {
    client,
    send: (message = {}) => {
      if (options.queryParams) {
        message = { ...message, ...options.queryParams };
      }

      return client.send(JSON.stringify(message));
    },
  };

  if (onConnect) onConnect(connection);

  return connection;
};

export default websocketClient;
import throwFrameworkError from "../lib/throwFrameworkError";

let reconnectInterval = null;
let reconnectAttempts = 0;

const websocketClient = (options = {}, onConnect = null) => {
  try {
    let url = options?.url;

    if (options?.query) {
      url = `${url}?${new URLSearchParams(options.query).toString()}`;
    }
  
    let client = new WebSocket(url);
  
    if (reconnectInterval) {
      clearInterval(reconnectInterval);
      reconnectInterval = null;
    }
  
    const connection = {
      client,
      send: (message = {}) => {
        return client.send(JSON.stringify(message));
      },
    };

    client.addEventListener("open", () => {
      if (options?.options?.logging) {
        console.log(`[joystick.websockets] Connected to ${options?.url}`);
      }
  
      if (options?.events?.onOpen) {
        options.events.onOpen(connection);
      }

      reconnectAttempts = 0;
    });
  
    client.addEventListener("message", (event) => {
      if (event?.data && options?.events?.onMessage) {
        options.events.onMessage(JSON.parse(event.data || {}), connection);
      }
    });
  
    client.addEventListener("close", (event) => {
      if (options?.options?.logging) {
        console.log(`[joystick.websockets] Disconnected from ${options?.url}`);
      }

      if (options?.events?.onClose) {
        options.events.onClose(event?.code, event?.reason, connection);
      }
  
      client = null;
  
      // NOTE: An intentional close refers to a close that was initiated by the user (refresh),
      // or, a close that was terminated purposefully by the server. An unintentional close
      // would be a server going down/restarting or not responding properly.
      const wasIntentionalClose = [1000, 1001]?.includes(event?.code);

      if (options?.options?.autoReconnect && !reconnectInterval && !wasIntentionalClose) {
        reconnectInterval = setInterval(() => {
          client = null;
  
          // NOTE: 12 attempts === try to reconnect for up to 1 minute (12 * 5 seconds between each attempt).
          if (reconnectAttempts < (options?.options?.reconnectAttempts || 12)) {
            websocketClient(options, onConnect);
  
            if (options?.options?.logging) {
              console.log(
                `[joystick.websockets] Attempting to reconnect (${
                  reconnectAttempts + 1
                }/12)...`
              );
            }
  
            reconnectAttempts += 1;
          } else {
            clearInterval(reconnectInterval);
          }
        }, ((options?.options?.reconnectDelayInSeconds * 1000) || 5000));
      }
    });
  
    if (onConnect) onConnect(connection);
  
    return connection;
  } catch (exception) {
    throwFrameworkError('websockets.client', exception);
  }
};

export default websocketClient;
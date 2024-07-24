import queryString from 'query-string';
import { WebSocketServer } from "ws";
import generate_id from "../generate_id.js";
import get_translations from './get_translations.js';

process.title = 'joystick_hmr';

export default (() => {
  const websocket_server = new WebSocketServer({
    port: parseInt(process.env.PORT, 10) + 1,
    path: "/_joystick/hmr",
  });

  process.on("message", async (message) => {
    const parsed_message = JSON.parse(message);

    if (typeof process.HMR_CONNECTIONS === "object" && !!parsed_message?.type) {
      const connections = Object.values(process.HMR_CONNECTIONS);

      for (let i = 0; i < connections?.length; i += 1) {
        const connection = connections[i];

        if (connection?.connection?.send) {
          if (parsed_message?.type === 'BUILD_ERROR') {
            connection.connection.send(JSON.stringify({ type: 'BUILD_ERROR' }));
          }

          if (parsed_message?.type === 'FILE_CHANGE') {
            console.log('SEND FILE CHANGE HMR');
            connection.connection.send(
              JSON.stringify({
                type: "FILE_CHANGE",
                settings: parsed_message?.settings ? {
                  global: parsed_message?.settings?.global,
                  public: parsed_message?.settings?.public,
                } : null,
                i18n: parsed_message?.i18n_change ? await get_translations('.joystick/build', connection?.page_component_path, {
                  headers: {
                    'accept-language': connection?.browser_language,
                  },
                  context: {
                    user: {
                      language: connection?.user_language,
                    },
                  }
                }) : null,
                index_html_changed: parsed_message?.index_html_change,
                index_css_changed: parsed_message?.index_css_change,
                index_client_changed: parsed_message?.index_client_change,
              })
            );
          }
        }
      }
    }
  });

  websocket_server.on("connection", function connection(websocket_connection, connection_request = {}) {
    const connection_id = generate_id(16);
    const [_path, params] = connection_request?.url?.split("?");
    const connection_params = queryString.parse(params);

    process.HMR_CONNECTIONS = {
      ...(process.HMR_CONNECTIONS || {}),
      [connection_id]: {
        connection: websocket_connection,
        browser_language: connection_params?.browser_language,
        user_language: connection_params?.user_language,
        page_component_path: connection_params?.page_component_path,
      },
    };

    if (Object.keys(process.HMR_CONNECTIONS || {})?.length > 0) {
      process.send({ type: "HAS_HMR_CONNECTIONS" });
    }

    websocket_connection.on("message", (message) => {
      const parsed_message = JSON.parse(message);

      if (parsed_message?.type === "HMR_UPDATE_COMPLETE") {
        process.send({ type: "HMR_UPDATE_COMPLETE" });
      }
    });

    websocket_connection.on("close", () => {
      if (process.HMR_CONNECTIONS[connection_id]) {
        delete process.HMR_CONNECTIONS[connection_id];

        if (Object.keys(process.HMR_CONNECTIONS || {})?.length === 0) {
          process.send({ type: "HAS_NO_HMR_CONNECTIONS" });
        }
      }
    });
  });
})();

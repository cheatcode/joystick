import types from "../lib/types.js";
import websocket_client from './client.js';

const register_on_component = (component_options = {}, component_instance = {}) => {
  const compiled_websockets_option = types.is_function(component_options.websockets) && component_options.websockets(component_instance);
  const websocket_definitions = types.is_object(compiled_websockets_option) && Object.entries(compiled_websockets_option);

  for (let i = 0; i < websocket_definitions?.length; i += 1) {
    const [websocket_name, websocket_definition] = websocket_definitions[i];

    if (!joystick?._internal?.websockets?.[component_instance.id]?.[websocket_name]) {
      joystick._internal.websockets = {
        ...(joystick?._internal?.websockets || {}),
        [component_instance.id]: {
          ...(joystick?._internal?.websockets?.[component_instance.id] || {}),
          [websocket_name]: websocket_client({
            component_instance,
            test: component_instance?.test,
            url: `${window?.process?.env.NODE_ENV === 'development' ? 'ws' : 'wss'}://${location.host}/api/_websockets/${websocket_name}`,
            options: websocket_definition?.options || {},
            query: websocket_definition?.query || {},
            events: websocket_definition?.events || {},
          }, (websocket_connection = {}) => {
            component_instance.websockets = {
              ...(component_instance.websockets || {}),
              [websocket_name]: websocket_connection,
            }
          }),
        },
      }
    }
  }
};

export default register_on_component;

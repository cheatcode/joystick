import generate_id from "../../lib/generate_id.js";
import track_function_call from "../../test/track_function_call.js";

const attach_event_listener_for_element = (event_listener = {}, element = {}, render_methods = {}) => {
	const handler = function event_handler(DOMEvent) {
    event_listener.handler(DOMEvent, {
      ...(event_listener?.instance || {}),
      set_state: event_listener?.instance?.setState.bind(event_listener?.instance),
      setState: event_listener?.instance?.setState.bind(event_listener?.instance),
      ...(render_methods || {}),
    });

    track_function_call(`ui.${event_listener?.instance?.options?.test?.name || generate_id()}.events.${event_listener.type}.selector_${event_listener?.selector}`, [
      DOMEvent,
      {
        ...(event_listener?.instance || {}),
        set_state: event_listener?.instance?.setState.bind(event_listener?.instance),
        setState: event_listener?.instance?.setState.bind(event_listener?.instance),
        ...(render_methods || {}),
      }
    ]);
  };

	element.addEventListener(event_listener?.type, handler);

  event_listener.instance._event_listeners = [
    ...(event_listener?.instance?._event_listeners || []),
    { selector: event_listener?.selector, type: event_listener?.type, element, handler },
  ];
};

export default attach_event_listener_for_element;

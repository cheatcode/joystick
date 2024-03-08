import serialize_events from "../component/events/serialize.js";

const get_event_listeners_for_nodes = (nodes = []) => {
	return nodes?.flatMap((node) => {
		const events_for_node = serialize_events(node?.events);
		return events_for_node?.flatMap((event_for_node) => {
			return {
				instance: node,
				...event_for_node,
			};
		});
	});
};

export default get_event_listeners_for_nodes;

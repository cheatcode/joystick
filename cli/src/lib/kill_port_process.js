import get_process_id_from_port from "./get_process_id_from_port.js";
import kill_process_id from "./kill_process_id.js";

const kill_port_process = async (port = 0) => {
	const process_id = await get_process_id_from_port(port);

	if (process_id) {
		await kill_process_id(process_id);
	}
};

export default kill_port_process;

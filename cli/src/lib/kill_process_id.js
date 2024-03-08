import child_process from 'child_process';
import util from 'util';

const exec = util.promisify(child_process.exec);

const kill_process_id = async (process_id = 0) => {
	const process_id_as_integer = parseInt(process_id, 10);
	
	if (process_id_as_integer) {
		if (process.platform === 'win32') {
			await exec(`taskkill /F /PID ${process_id_as_integer}`);
			return;
		}

		await exec(`kill -9 ${process_id_as_integer}`);
	}
};

export default kill_process_id;

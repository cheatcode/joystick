import child_process from 'child_process';
import util from 'util';

const exec = util.promisify(child_process.exec);

const command_exists = (command = '') => {
	const where_command = process.platform === 'win32' ? 'where' : 'whereis';
	return exec(`${where_command} ${command}`).then(() => {
		return true;
	}).catch((error) => {
		console.warn(error);
		return false;
	});
};

export default command_exists;

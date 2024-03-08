import child_process from 'child_process';
import util from 'util';

const exec = util.promisify(child_process.exec);

const get_process_id_from_port = async (port = 0) => {
	if (process.platform === 'win32') {
		return exec(`netstat -a -n -o | find "${port}"`)
			.then((stat) => {
				const stat_result = stat.stdout?.split('\n');
				const process_id_response = stat_result && stat_result[0] && stat_result[0]?.split(' ')?.filter((value) => value !== '')?.map((value) => {
					return value?.replace('\r', '');
				})?.pop();

				return process_id_response || null;
			})
			.catch(() => {
				return null;
			});
	}

	const process_id_response = await exec(`lsof -n -i:${port} | grep LISTEN | awk '{ print $2 }' | uniq`);
	return process_id_response?.stdout || null;
};

export default get_process_id_from_port;

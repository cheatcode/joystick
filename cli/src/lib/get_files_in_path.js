import fs from 'fs';
import { join } from 'path';

const { readdir, stat } = fs.promises;

const get_files_in_path = async (path = './', existing_files = []) => {
	const files_in_path = (await readdir(path))?.map((file_in_path) => {
		return join(path, file_in_path);
	});

	existing_files.push(...files_in_path);

	for (let i = 0; i < files_in_path?.length; i += 1) {
		const file = files_in_path[i];
		const is_directory = (await stat(file)).isDirectory();

		if (is_directory) {
			await get_files_in_path(file, existing_files);
		}
	}

	return existing_files;
};

export default get_files_in_path;

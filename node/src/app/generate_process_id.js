import fs from 'fs';
import generate_id from '../lib/generate_id.js';
import path_exists from '../lib/path_exists.js';

const { mkdir, writeFile, readFile } = fs.promises;

const generate_process_id = async () => {
	  // NOTE: Taint machine with a unique ID that can be used to identify a single running
    // process/instance of Joystick (helpful when running in cluster mode or multiple servers).
		const joystick_folder_path = './.joystick';
		const joystick_process_id_path = './.joystick/PROCESS_ID';
		const has_joystick_folder = await path_exists(joystick_folder_path);
		const has_joystick_process_id = await path_exists(joystick_process_id_path);

    if (!has_joystick_folder) {
      await mkdir(joystick_folder_path);
    }

    if (!has_joystick_process_id) {
    	const joystick_process_id = generate_id(32);
      await writeFile(joystick_process_id_path, `${generate_id(32)}`);
      return joystick_process_id;
    }

    const joystick_process_id = await readFile(joystick_process_id_path, 'utf-8');

    return joystick_process_id?.trim();
  };

  export default generate_process_id;

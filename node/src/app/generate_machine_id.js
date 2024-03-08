import fs from 'fs';
import os from 'os';
import path from 'path';
import generate_id from '../lib/generate_id.js';
import path_exists from '../lib/path_exists.js';

const { mkdir, writeFile, readFile } = fs.promises;

const generate_machine_id = async () => {
  const home = os.homedir();
  const joystick_machine_id_path = `${home}/.cheatcode/MACHINE_ID`;
  const has_joystick_machine_id = await path_exists(joystick_machine_id_path);

  if (!has_joystick_machine_id) {
    const joystick_machine_id = generate_id(32);
    await mkdir(path.dirname(joystick_machine_id_path), { recursive: true });
    await writeFile(joystick_machine_id_path, joystick_machine_id);
    return joystick_machine_id;
  }

  const joystick_machine_id = await readFile(joystick_machine_id_path, 'utf-8');

  return joystick_machine_id?.trim();
;}

export default generate_machine_id;

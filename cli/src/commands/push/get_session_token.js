import os from 'os';
import fs from 'fs';
import inquirer from 'inquirer';
import path_exists from '../../lib/path_exists.js';
import session_token_prompt from './prompts/session_token.js';

const { readFile, mkdir, writeFile } = fs.promises;

const get_session_token = async () => {
  const home_directory = os.homedir();
  const session_token_path = `${home_directory}/.push/session_token`;
  const session_token_exists = await path_exists(session_token_path);

  if (session_token_exists) {
    return readFile(session_token_path, 'utf-8');
  }
 
  const { session_token } = await inquirer.prompt(session_token_prompt());

  if (session_token) {
	  if (!(await path_exists(`${home_directory}/.push`))) {
	    await mkdir(`${home_directory}/.push`);
	  }

	  await writeFile(`${home_directory}/.push/session_token`, session_token);

	  return session_token;
  }
};

export default get_session_token;

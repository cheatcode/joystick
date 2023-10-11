import os from 'os';
import fs from 'fs';
import inquirer from 'inquirer';
import session_token_prompt from './prompts/session_token.js';

export default async () => {
  const home_directory = os.homedir();
  const session_token_path = `${home_directory}/.push/session_token`;
  const session_token_exists = fs.existsSync(session_token_path);

  if (session_token_exists) {
    return fs.readFileSync(session_token_path, 'utf-8');
  }
 
  const { session_token } = await inquirer.prompt(session_token_prompt());

  if (session_token) {
	  if (!fs.existsSync(`${home_directory}/.push`)) {
	    fs.mkdirSync(`${home_directory}/.push`);
	  }

	  fs.writeFileSync(`${home_directory}/.push/session_token`, session_token);

	  return session_token;
  }
};
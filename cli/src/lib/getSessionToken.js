import os from 'os';
import fs from 'fs';
import inquirer from 'inquirer';
import prompts from '../functions/push/prompts.js';
import loginToCheatCode from './loginToCheatCode.js';

export default async () => {
  const homeDirectory = os.homedir();
  const sessionTokenPath = `${homeDirectory}/.cheatcode/session`;
  const sessionTokenExists = fs.existsSync(sessionTokenPath);

  if (sessionTokenExists) {
    return fs.readFileSync(sessionTokenPath, 'utf-8');
  }
 
  const promptUserLogin = await inquirer.prompt(prompts.login());
  const sessionToken = promptUserLogin?.oauth || await loginToCheatCode(promptUserLogin?.emailAddress, promptUserLogin?.password);

  if (!fs.existsSync(`${homeDirectory}/.cheatcode`)) {
    fs.mkdirSync(`${homeDirectory}/.cheatcode`);
  }

  fs.writeFileSync(`${homeDirectory}/.cheatcode/session`, sessionToken);

  return sessionToken;
};
import os from 'os';
import fs, { cp } from 'fs';
import colorLog from '../../lib/colorLog.js';

export default async () => {
  try {
    const homeDirectory = os.homedir();
    const sessionTokenPath = `${homeDirectory}/.cheatcode/session`;
    const sessionTokenExists = fs.existsSync(sessionTokenPath);

    if (sessionTokenExists) {
      fs.unlinkSync(sessionTokenPath, 'utf-8');
      colorLog('\n✔ Logged out\n', 'greenBright');
    }

    return true;
  } catch (exception) {
    throw new Error(`[logout] ${exception.message}`);
  }
};
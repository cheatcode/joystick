import fs from 'fs';
import os from 'os';
import color_log from '../../lib/color_log.js';
import path_exists from '../../lib/path_exists.js';

const { unlink } = fs.promises;

const logout = async (args = {}, options = {}) => {
  const session_token_path = `${os.homedir()}/.push/session_token`;
  const session_token_exists = await path_exists(session_token_path);

  if (session_token_exists) {
    await unlink(session_token_path, 'utf-8');
    color_log('\n✔ Logged out\n', 'greenBright');
  }

  return true;
};

export default logout;

import os from 'os';
import fs from 'fs';
import path_exists from '../../lib/path_exists.js';

const { readFile, mkdir, writeFile } = fs.promises;

const get_deployment_token = async (deployment_token = '') => { 
  const home_directory = os.homedir();

  if (deployment_token) {
	  if (!(await path_exists(`${home_directory}/.push`))) {
	    await mkdir(`${home_directory}/.push`);
	  }

	  await writeFile(`${home_directory}/.push/deployment_token`, deployment_token);

	  return deployment_token;
  }

  const deployment_token_path = `${home_directory}/.push/deployment_token`;
  const deployment_token_exists = await path_exists(deployment_token_path);

  if (deployment_token_exists) {
    return readFile(deployment_token_path, 'utf-8');
  }

  return null;
};

export default get_deployment_token;

import os from 'os';
import { dirname } from "path";
import { fileURLToPath as file_url_to_path } from "url";

const current_file_path = file_url_to_path(import.meta.url);
const __package = dirname(current_file_path);
const is_windows = os.platform() === 'win32';

const node_path_polyfills = {
	__package: __package?.replace(
    is_windows ? '\\dist\\lib' : '/dist/lib',
    is_windows ? '\\dist' : '/dist'
  ),
  __filename: (url = '') => {
    return file_url_to_path(url);
  },
  __dirname: (url = '') => {
    const currentFilePath = file_url_to_path(url);
    return dirname(currentFilePath);
  },
};

export default node_path_polyfills;

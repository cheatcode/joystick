import { fileURLToPath } from "url";
import { dirname } from "path";

export default {
  __filename: (url = '') => {
    return fileURLToPath(url);
  },
  __dirname: (url = '') => {
    const currentFilePath = fileURLToPath(url);
    return dirname(currentFilePath);
  },
};
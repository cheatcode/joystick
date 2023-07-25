import { fileURLToPath } from "url";
import { dirname } from "path";
var nodeUrlPolyfills_default = {
  __filename: (url = "") => {
    return fileURLToPath(url);
  },
  __dirname: (url = "") => {
    const currentFilePath = fileURLToPath(url);
    return dirname(currentFilePath);
  }
};
export {
  nodeUrlPolyfills_default as default
};

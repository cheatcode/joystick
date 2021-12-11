import { URL } from "url";
var nodeUrlPolyfills_default = {
  __filename: (url = null) => {
    if (!url) {
      return "";
    }
    return new URL("", url).pathname;
  },
  __dirname: (url = null) => {
    if (!url) {
      return "";
    }
    return new URL(".", url).pathname;
  }
};
export {
  nodeUrlPolyfills_default as default
};

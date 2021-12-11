import { dirname } from "path";
import { fileURLToPath } from "url";
console.log(import.meta);
var dirnamePolyfill_default = dirname(fileURLToPath(import.meta.url));
export {
  dirnamePolyfill_default as default
};

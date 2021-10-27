import { exec } from "child_process";
import { fileURLToPath } from "url";
import { dirname } from "path";
import Loader from "../../lib/loader.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default () => {
  console.log("");
  const loader = new Loader({ defaultMessage: "Building app..." });
  loader.start("Building app...");
  const cliPath = __dirname.replace("/functions/build", "");
  const rollupPath = `${__dirname.replace(
    "/dist",
    "/node_modules/rollup/dist/bin/rollup"
  )}`;

  exec(`${rollupPath} -c ${cliPath}/lib/rollup.config.js`, (stderr, stdout) => {
    if (stderr) {
      console.log(stderr);
    } else {
      loader.pause("App built to .joystick/build!");
      console.log("");
      console.log(stdout);
    }
  });
};

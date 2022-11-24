import chalk from "chalk";
import child_process from "child_process";
import Loader from "../../lib/loader.js";
process.loader = new Loader({ defaultMessage: "Updating Joystick dependencies..." });
var update_default = () => {
  process.loader.text("Updating @joystick.js/node...");
  child_process.exec("npm i @joystick.js/node@latest", () => {
    process.loader.text("Updating @joystick.js/ui...");
    child_process.exec("npm i @joystick.js/ui@latest", () => {
      process.loader.text("Updating @joystick.js/cli...");
      child_process.exec("npm i -g @joystick.js/cli@latest", () => {
        process.loader.stop();
        console.log(chalk.green("Joystick updated!"));
        process.exit(0);
      });
    });
  });
};
export {
  update_default as default
};

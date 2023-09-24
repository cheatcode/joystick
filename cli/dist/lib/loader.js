import chalk from "chalk";
import readline from "readline";
class Loader {
  constructor(options = {}) {
    this.message = options.defaultMessage;
  }
  print(message = "", error = false) {
    if (message) {
      this.message = message;
    }
    process.stdout.write(`${chalk[error ? "redBright" : "yellowBright"](">")} ${this.message}
`);
  }
  error(message = "") {
    this.print(message, true);
  }
  stop() {
  }
}
var loader_default = Loader;
export {
  loader_default as default
};

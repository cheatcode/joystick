import chalk from "chalk";

class Loader {
  constructor(options = {}) {
    this.message = options.default_message;
  }

  print(message = "", error = false) {
    if (message) {
      this.message = message;
    }

    process.stdout.write(`${chalk[error ? 'redBright' : 'yellowBright']('>')} ${this.message}\n`);
  }

  error(message = "") {
    this.print(message, true);
  }
}

export default Loader;

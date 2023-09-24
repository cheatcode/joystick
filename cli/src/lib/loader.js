import chalk from "chalk";
import readline from 'readline';

class Loader {
  constructor(options = {}) {
    this.message = options.defaultMessage;
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

  stop() {
    // NOTE: Legacy placeholder.
    // TODO: Strip all calls to loader.stop();
  }
}

export default Loader;

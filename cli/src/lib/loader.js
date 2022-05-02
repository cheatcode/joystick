import chalk from "chalk";
import readline from 'readline';

class Loader {
  constructor(options = {}) {
    this.message = options.defaultMessage;
    this.frame = 0;
    this.frames = [
      chalk.yellowBright((options.padding || '') + ">>-----"),
      chalk.yellowBright((options.padding || '') + "->>----"),
      chalk.yellowBright((options.padding || '') + "-->>---"),
      chalk.yellowBright((options.padding || '') + "--->>--"),
      chalk.yellowBright((options.padding || '') + "---->>-"),
      chalk.yellowBright((options.padding || '') + "----->>"),
      chalk.yellowBright((options.padding || '') + "----<<-"),
      chalk.yellowBright((options.padding || '') + "---<<--"),
      chalk.yellowBright((options.padding || '') + "--<<---"),
      chalk.yellowBright((options.padding || '') + "-<<----"),
      chalk.yellowBright((options.padding || '') + "<<-----"),
    ];
    this.freezeFrames = {
      stable: chalk.yellowBright((options.padding || '') + "--->---"),
      error: chalk.redBright((options.padding || '') + "!!!"),
    };
  }

  getFrame() {
    if (this.frame === this.frames.length - 1) {
      this.frame = 0;
      return this.frame;
    }

    this.frame += 1;
    return this.frame;
  }

  start(message = "") {
    if (message) {
      this.message = message;
    }

    this.interval = setInterval(() => {
      const frameToRender = this.getFrame();
      readline.cursorTo(process.stdout, 0);
      process.stdout.write(`${this.frames[frameToRender]} ${this.message}`);
    }, 80);
  }

  stop() {
    clearInterval(this.interval);
    readline.cursorTo(process.stdout, 0);
    readline.clearLine(process.stdout);
    this.message = "";
    this.interval = null;
  }

  text(message = "") {
    readline.clearLine(process.stdout);

    if (message) {
      this.message = message;
    }

    if (!this.interval) {
      this.start();
    }
  }

  pause(message = "", frame = "stable") {
    readline.clearLine(process.stdout);

    if (message) {
      this.message = message;
    }

    clearInterval(this.interval);
    this.interval = null;
    const freezeFrame = this.freezeFrames[frame];
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(
      `${freezeFrame ? `${freezeFrame} ` : ""}${this.message}`
    );
  }

  stable(message = "") {
    this.pause(message);
  }

  error(message = "") {
    this.pause(message, "error");
  }
}

export default Loader;

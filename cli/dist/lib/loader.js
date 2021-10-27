import chalk from "chalk";
class Loader {
  constructor(options = {}) {
    this.message = options.defaultMessage;
    this.frame = 0;
    this.frames = [
      chalk.yellowBright(">>-----"),
      chalk.yellowBright("->>----"),
      chalk.yellowBright("-->>---"),
      chalk.yellowBright("--->>--"),
      chalk.yellowBright("---->>-"),
      chalk.yellowBright("----->>"),
      chalk.yellowBright("----<<-"),
      chalk.yellowBright("---<<--"),
      chalk.yellowBright("--<<---"),
      chalk.yellowBright("-<<----"),
      chalk.yellowBright("<<-----")
    ];
    this.freezeFrames = {
      stable: chalk.yellowBright("--->---"),
      error: chalk.redBright("!!!")
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
      process.stdout.cursorTo(0);
      process.stdout.write(`${this.frames[frameToRender]} ${this.message}`);
    }, 80);
  }
  stop() {
    clearInterval(this.interval);
    process.stdout.cursorTo(0);
    process.stdout.clearLine();
    this.message = "";
    this.interval = null;
  }
  text(message = "") {
    process.stdout.clearLine();
    if (message) {
      this.message = message;
    }
    if (!this.interval) {
      this.start();
    }
  }
  pause(message = "", frame = "stable") {
    process.stdout.clearLine();
    if (message) {
      this.message = message;
    }
    clearInterval(this.interval);
    this.interval = null;
    const freezeFrame = this.freezeFrames[frame];
    process.stdout.cursorTo(0);
    process.stdout.write(`${freezeFrame ? `${freezeFrame} ` : ""}${this.message}`);
  }
  stable(message = "") {
    this.pause(message);
  }
  error(message = "") {
    this.pause(message, "error");
  }
}
var loader_default = Loader;
export {
  loader_default as default
};

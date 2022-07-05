class QueueArray {
  constructor(defaultValue = []) {
    this.array = [...defaultValue];
    this.array.push = function () {
      Array.prototype.push.apply(this, arguments);
    };
  }

  async process() {
    if (this.array.length > 0) {
      const element = this.array.shift();

      if (element && element.callback) {
        await element.callback();
        this.process();
      }
    }
  }
}

export default QueueArray;
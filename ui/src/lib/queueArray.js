class QueueArray {
  constructor(defaultValue = []) {
    this.array = [...defaultValue];
    this.array.push = function () {
      Array.prototype.push.apply(this, arguments);
    };
  }

  async process(callback = null) {
    if (this.array.length > 0) {
      const element = this.array.shift();

      if (element && element.callback) {
        await element.callback();
        this.process(callback);
      }
    } else {
      if (callback) callback();
    }
  }
}

export default QueueArray;
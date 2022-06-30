class QueueArray {
  constructor(defaultValue = [], onChange = null) {
    const instance = this;
    this.processing = false;
    this.array = [...defaultValue];
    this.array.push = function () {
      Array.prototype.push.apply(this, arguments);
      if (onChange && !instance.processing) {
        onChange(instance);
      }
    };
  }

  async process() {
    if (this.array.length > 0) {
      this.processing = true;
      const element = this.array.shift();

      if (element && element.callback) {
        await element.callback();
        this.process();
      }
    } else {
      this.processing = false;
    }
  }
}

export default QueueArray;

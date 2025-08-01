import Transport from 'winston-transport';

class ExternalTransport extends Transport {
  constructor({ on_log, ...opts }) {
    super(opts);
    this.on_log = on_log;
  }

  log(log = {}, callback = () => {}) {
    setImmediate(() => {
      this.emit('logged', log);
    });

    if (typeof this.on_log === 'function') {
      this.on_log(log);
    }

    callback();
  }
}

export default ExternalTransport;

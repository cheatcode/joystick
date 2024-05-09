import debounce from "./debounce.js";

class DebouncedQueue {
  constructor() {
    this.queue = [];
  }
  
  add(job = () => {}) {
    this.queue.push(job);
    this.run();
  }
  
  run() {
    // NOTE: Debounce so that last job in triggers the queue after 300ms delay.
    debounce(async () => {
      if (this.queue?.length > 0) {
        const job_to_run = this.queue.shift();
        await job_to_run();
      }

      this.run();
    }, 100);
  }
}

export default DebouncedQueue;
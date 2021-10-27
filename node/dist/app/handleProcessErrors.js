var handleProcessErrors_default = (listeners = {}) => {
  process.on("exit", async () => {
  });
  process.on("beforeExit", async (code) => {
    if (listeners?.beforeExit && typeof listeners.beforeExit === "function") {
      listeners.beforeExit(code);
    }
  });
  process.on("disconnect", async () => {
    if (listeners?.disconnect && typeof listeners.disconnect === "function") {
      listeners.disconnect();
    }
  });
  process.on("exit", async (code) => {
    if (listeners?.exit && typeof listeners.exit === "function") {
      listeners.exit(code);
    }
  });
  process.on("message", async (message, sendHandle) => {
    console.log(message);
    if (listeners?.message && typeof listeners.message === "function") {
      listeners.message(message, sendHandle);
    }
  });
  process.on("multipleResolves", async (type, promise, value) => {
    if (listeners?.multipleResolves && typeof listeners.multipleResolves === "function") {
      listeners.multipleResolves(type, promise, value);
    }
  });
  process.on("rejectionHandled", async (promise) => {
    if (listeners?.rejectionHandled && typeof listeners.rejectionHandled === "function") {
      listeners.rejectionHandled(promise);
    }
  });
  process.on("uncaughtException", async (error, origin) => {
    console.warn(error);
    if (listeners?.error && typeof listeners.error === "function") {
      listeners.error(error);
    }
    if (listeners?.uncaughtException && typeof listeners.uncaughtException === "function") {
      listeners.uncaughtException(error, origin);
    }
  });
  process.on("uncaughtExceptionMonitor", async (error) => {
    if (listeners?.uncaughtExceptionMonitor && typeof listeners.uncaughtExceptionMonitor === "function") {
      listeners.uncaughtExceptionMonitor(error);
    }
  });
  process.on("unhandledRejection", async (error) => {
    console.warn(error);
    if (listeners?.error && typeof listeners.error === "function") {
      listeners.error(error);
    }
    if (listeners?.unhandledRejection && typeof listeners.unhandledRejection === "function") {
      listeners.unhandledRejection(error);
    }
  });
  process.on("warning", async (warning) => {
    if (listeners?.warning && typeof listeners.warning === "function") {
      listeners.warning(warning);
    }
  });
  process.on("worker", async (event) => {
    if (listeners?.worker && typeof listeners.worker === "function") {
      listeners.worker(event);
    }
  });
};
export {
  handleProcessErrors_default as default
};

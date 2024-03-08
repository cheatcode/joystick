const handle_process_errors = (event_listeners = {}) => {
  process.on("disconnect", async () => {
    if (event_listeners?.disconnect && typeof event_listeners.disconnect === "function") {
      event_listeners.disconnect();
    }
  });
  
  process.on("beforeExit", async (code) => {
    if (event_listeners?.beforeExit && typeof event_listeners.beforeExit === "function") {
      event_listeners.beforeExit(code);
    }
  });

  process.on("exit", async (code) => {
    if (event_listeners?.exit && typeof event_listeners.exit === "function") {
      event_listeners.exit(code);
    }
  });

  process.on("message", async (message, sendHandle) => {
    if (process.env.NODE_ENV !== "test") {
      console.log(message);
    }

    if (event_listeners?.message && typeof event_listeners.message === "function") {
      event_listeners.message(message, sendHandle);
    }
  });

  process.on("multipleResolves", async (type, promise, value) => {
    if (
      event_listeners?.multipleResolves &&
      typeof event_listeners.multipleResolves === "function"
    ) {
      event_listeners.multipleResolves(type, promise, value);
    }
  });

  process.on("rejectionHandled", async (promise) => {
    if (
      event_listeners?.rejectionHandled &&
      typeof event_listeners.rejectionHandled === "function"
    ) {
      event_listeners.rejectionHandled(promise);
    }
  });

  process.on("uncaughtException", async (error, origin) => {
    console.warn(error);

    if (event_listeners?.error && typeof event_listeners.error === "function") {
      event_listeners.error(error);
    }

    if (
      event_listeners?.uncaughtException &&
      typeof event_listeners.uncaughtException === "function"
    ) {
      event_listeners.uncaughtException(error, origin);
    }
  });

  process.on("uncaughtExceptionMonitor", async (error) => {
    if (
      event_listeners?.uncaughtExceptionMonitor &&
      typeof event_listeners.uncaughtExceptionMonitor === "function"
    ) {
      event_listeners.uncaughtExceptionMonitor(error);
    }
  });

  process.on("unhandledRejection", async (error) => {
    console.warn(error);

    if (event_listeners?.error && typeof event_listeners.error === "function") {
      event_listeners.error(error);
    }

    if (
      event_listeners?.unhandledRejection &&
      typeof event_listeners.unhandledRejection === "function"
    ) {
      event_listeners.unhandledRejection(error);
    }
  });

  process.on("warning", async (warning) => {
    if (event_listeners?.warning && typeof event_listeners.warning === "function") {
      event_listeners.warning(warning);
    }
  });

  process.on("worker", async (event) => {
    if (event_listeners?.worker && typeof event_listeners.worker === "function") {
      event_listeners.worker(event);
    }
  });
};

export default handle_process_errors;


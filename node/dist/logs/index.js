import dayjs from "dayjs";
import ObsceneDB from "../lib/obscenedb";
const captureLog = (callback = null) => {
  process.stdout.write = (data) => {
    if (callback) {
      callback("stdout", data);
    }
  };
  process.stderr.write = (data) => {
    if (callback) {
      callback("stderr", data);
    }
  };
  process.on("uncaughtException", (error) => {
    if (callback) {
      callback("uncaughtException", error);
    }
  });
};
const writeLogsToDisk = () => {
  const db = new ObsceneDB({
    file: {
      development: "logs.json",
      production: "/root/logs.json"
    }[process.env.NODE_ENV || "development"],
    collections: {
      logs: []
    }
  });
  captureLog((source = "", data = "") => {
    switch (source) {
      case "stdout":
        return db.insert("logs", {
          error: false,
          timestamp: dayjs().format(),
          data
        });
      case "stderr":
      case "uncaughtException":
        return db.insert("logs", {
          error: true,
          timestamp: dayjs().format(),
          data
        });
      default:
        return;
    }
  });
};
var logs_default = () => {
  return writeLogsToDisk();
};
export {
  logs_default as default
};

import fs from "fs";
import SQLite from "better-sqlite3";
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
const writeLogsToSQLite = () => {
  const sqlite = new SQLite("/root/logs.db");
  sqlite.prepare("CREATE TABLE IF NOT EXISTS logs (timestamp text, error integer, message text)").run();
  captureLog((source = "", data = "") => {
    const statement = sqlite.prepare("INSERT INTO logs VALUES (?, ?, ?)");
    switch (source) {
      case "stdout":
        return statement.run(new Date().toISOString(), 0, data);
      case "stderr":
      case "uncaughtException":
        return statement.run(new Date().toISOString(), 1, data);
      default:
        return;
    }
  });
};
const writeLogsToDisk = () => {
  const validLogsPath = process.env.LOGS_PATH && process.env.LOGS_PATH !== "null";
  const logsPath = validLogsPath ? process.env.LOGS_PATH : "./logs";
  if (!fs.existsSync(logsPath)) {
    fs.mkdirSync(logsPath);
  }
  if (!fs.existsSync(`${logsPath}/app.log`)) {
    fs.writeFileSync(`${logsPath}/app.log`, "");
  }
  const appLog = fs.createWriteStream(`${logsPath}/app.log`);
  captureLog((source = "", data = "") => {
    switch (source) {
      case "stdout":
        return appLog.write(`{ "error": false, "timestamp": "${new Date().toISOString()}", "data": ${JSON.stringify(data.replace("\n", ""))} }
`);
      case "stderr":
        return appLog.write(`{ "error": true, "timestamp": "${new Date().toISOString()}", "data": ${JSON.stringify(data.replace("\n", ""))} }
`);
      case "uncaughtException":
        return console.error(`{ "error": true, "timestamp": "${new Date().toISOString()}", "data": ${JSON.stringify(data && data.stack ? data.stack : data)} }
`);
      default:
        return;
    }
  });
};
var logs_default = () => {
  if (process.env.NODE_ENV !== "production") {
    return false;
  }
  if (process.env.IS_JOYSTICK_DEPLOY !== "true") {
    return writeLogsToDisk();
  }
  return writeLogsToSQLite();
};
export {
  logs_default as default
};

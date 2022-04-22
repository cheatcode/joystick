import fs from "fs";
var logs_default = () => {
  const developmentLogsPath = process.env.LOGS_PATH || "./logs";
  const productionLogsPath = process.env.LOGS_PATH || "/logs";
  const logsPath = process.env.NODE_ENV === "development" ? developmentLogsPath : productionLogsPath;
  if (!fs.existsSync(logsPath)) {
    fs.mkdirSync(logsPath);
  }
  if (!fs.existsSync(`${logsPath}/app.log`)) {
    fs.writeFileSync(`${logsPath}/app.log`, "");
  }
  const appLog = fs.createWriteStream(`${logsPath}/app.log`);
  process.stdout.write = (data) => {
    appLog.write(`{ "error": false, "timestamp": "${new Date().toISOString()}", "data": ${JSON.stringify(data.replace("\n", ""))} }
`);
  };
  process.stderr.write = (data) => {
    appLog.write(`{ "error": true, "timestamp": "${new Date().toISOString()}", "data": ${JSON.stringify(data.replace("\n", ""))} }
`);
  };
  process.on("uncaughtException", function(error) {
    console.error(`{ "error": true, "timestamp": "${new Date().toISOString()}", "data": ${JSON.stringify(error && error.stack ? error.stack : error)} }
`);
  });
};
export {
  logs_default as default
};

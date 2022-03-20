import fs from 'fs';

export default () => {
  const logsPath = process.env.NODE_ENV === 'development' ? './logs' : '/logs';

  if (!fs.existsSync(logsPath)) {
    fs.mkdirSync(logsPath);
  }
  
  if (!fs.existsSync(`${logsPath}/app.log`)) {
    fs.writeFileSync(`${logsPath}/app.log`, '');
  }
  
  const appLog = fs.createWriteStream(`${logsPath}/app.log`);
  
  process.stdout.write = (data) => {
    appLog.write(`{ "error": false, "timestamp": "${new Date().toISOString()}", "data": ${JSON.stringify(data.replace('\n', ''))} }\n`);
  };

  process.stderr.write = (data) => {
    appLog.write(`{ "error": true, "timestamp": "${new Date().toISOString()}", "data": ${JSON.stringify(data.replace('\n', ''))} }\n`);
  };
  
  process.on('uncaughtException', function(error) {
    console.error(`{ "error": true, "timestamp": "${new Date().toISOString()}", "data": ${JSON.stringify(((error && error.stack) ? error.stack : error))} }\n`);
  });
};
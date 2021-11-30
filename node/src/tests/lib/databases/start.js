import setAppSettingsForTest from '../tests/lib/setAppSettingsForTest';
import startMongoDB from '../tests/lib/databases/mongodb/start';

export default (databaseName = '') => {
  await killPortProcess(process.env.PORT + 1);
  let processId;
  
  if (databaseName === 'mongodb') {
    processId = await startMongoDB();
  }

  process.env.databases = JSON.stringify({
    [databaseName]: {
      pid: processId,
      connection: {
        hosts: [
          {
            hostname: "127.0.0.1",
            port: process.env.PORT + 1,
          },
        ],
        database: "app",
        username: "",
        password: "",
      },
      settings,
    },
  });

  return Promise.resolve(processId);
};
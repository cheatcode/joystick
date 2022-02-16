import { killPortProcess } from "kill-port-process";
import startMongoDB from "./mongodb/start";
var start_default = async (databaseName = "") => {
  await killPortProcess(parseInt(process.env.PORT, 10) + 1);
  let processId;
  if (databaseName === "mongodb") {
    processId = await startMongoDB();
  }
  process.env.databases = JSON.stringify({
    [databaseName]: {
      pid: processId,
      connection: {
        hosts: [
          {
            hostname: "127.0.0.1",
            port: parseInt(process.env.PORT, 10) + 1
          }
        ],
        database: "app",
        username: "",
        password: ""
      },
      settings: {}
    }
  });
  return Promise.resolve(processId);
};
export {
  start_default as default
};

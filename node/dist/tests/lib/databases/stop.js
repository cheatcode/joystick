import { killPortProcess } from "kill-port-process";
import reset from "./mongodb/reset";
var stop_default = async () => {
  await reset(process.databases.mongodb);
  await killPortProcess(parseInt(process.env.PORT, 10) + 1);
};
export {
  stop_default as default
};

import { killPortProcess } from "kill-port-process";
import reset from "./mongodb/reset";

export default async () => {
  await reset(process.databases.mongodb);
  await killPortProcess(parseInt(process.env.PORT, 10) + 1);
};
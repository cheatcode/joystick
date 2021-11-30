import { killPortProcess } from "kill-port-process";

export default async () => {
  await killPortProcess(process.env.PORT + 1);
};
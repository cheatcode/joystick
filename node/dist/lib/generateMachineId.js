import fs from "fs";
import path from "path";
import os from "os";
import generateId from "./generateId.js";
var generateMachineId_default = () => {
  const home = os.homedir();
  if (!fs.existsSync(`${home}/.cheatcode/MACHINE_ID`)) {
    fs.mkdirSync(path.dirname(`${home}/.cheatcode/MACHINE_ID`), { recursive: true });
    fs.writeFileSync(`${home}/.cheatcode/MACHINE_ID`, generateId(32));
  }
  ;
};
export {
  generateMachineId_default as default
};

import fs from "fs";
import { codeFrameColumns } from "@babel/code-frame";
var getCodeFrame_default = (path = "", location = {}) => {
  const file = fs.readFileSync(path, "utf-8");
  return codeFrameColumns(file, { start: location });
};
export {
  getCodeFrame_default as default
};

import fs from "fs";
import { codeFrameColumns } from "@babel/code-frame";
var getCodeFrame_default = (id = "", location = {}) => {
  const file = fs.readFileSync(id, "utf-8");
  const frame = codeFrameColumns(file, { start: location });
  return frame;
};
export {
  getCodeFrame_default as default
};

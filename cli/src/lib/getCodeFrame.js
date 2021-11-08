import fs from 'fs';
import { codeFrameColumns } from "@babel/code-frame";

export default (id = "", location = {}) => {
  const file = fs.readFileSync(id, "utf-8");
  const frame = codeFrameColumns(file, { start: location });
  return frame;
};
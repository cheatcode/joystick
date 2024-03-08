import fs from 'fs';
import { codeFrameColumns } from "@babel/code-frame";

const { readFile } = fs.promises;

const get_code_frame = async (path = "", location = {}) => {
  const file = await readFile(path, "utf-8");
  return codeFrameColumns(file, { start: location });
};

export default get_code_frame;

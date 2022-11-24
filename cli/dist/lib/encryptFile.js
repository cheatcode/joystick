import fs from "fs";
import crypto from "crypto";
var encryptFile_default = (options = {}) => {
  return new Promise((resolve) => {
    const cipher = crypto.createCipheriv("aes256", options?.password, options?.password?.substring(0, 16));
    const input = fs.createReadStream(options?.in);
    const output = fs.createWriteStream(options?.out);
    input.pipe(cipher).pipe(output);
    output.on("close", function() {
      resolve();
    });
  });
};
export {
  encryptFile_default as default
};

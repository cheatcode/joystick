import fs from 'fs';
import crypto from 'crypto';

export default (options = {}) => {
  return new Promise((resolve) => {
    const cipher = crypto.createDecipheriv('aes256', options?.password,  options?.password?.substring(0, 16));
    const input = fs.createReadStream(options?.in);
    const output = fs.createWriteStream(options?.out);
  
    input.pipe(cipher).pipe(output);
  
    output.on('close', () => {
      resolve();
    });
  });
};



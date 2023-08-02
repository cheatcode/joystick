import fs from 'fs';
import log from "../../lib/log";

export default async (path = '', options = {}) => {
  const sanitizedPath = path?.charAt(0) === '/' ? path.substring(1, path.length) : path;
  const buildPath = `.joystick/build/${sanitizedPath}`;
  const pathExists = fs.existsSync(buildPath);
  
  if (!pathExists) {
    log(`[test.load] Path at ${buildPath} not found.`, {
      level: 'warning',
      docs: 'https://cheatcode.co/docs/joystick/test/load',
    });
    
    return null;
  }
  
  const contents = await import(buildPath);
  
  return (contents?.default && options?.default) ? contents.default : contents;
};

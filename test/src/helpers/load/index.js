import fs from 'fs';
import CLILog from "../../lib/CLILog.js";

const uncachedImport = async (path = '', options = {}) => {
  const modulePath = `${path}?update=${Date.now()}`
  const contents = await import(modulePath);
  return (contents?.default && options?.default) ? contents.default : contents;
};

export default async (path = '', options = {}) => {
  const sanitizedPath = path?.charAt(0) === '/' ? path.substring(1, path.length) : path;
  // NOTE: Use timestamp to cache bust on import() below.
  const buildPath = `${process.cwd()}/.joystick/build/${sanitizedPath}`;
  const pathExists = fs.existsSync(buildPath);
  
  if (!pathExists) {
    CLILog(`[test.load] Path at ${buildPath} not found.`, {
      level: 'warning',
      docs: 'https://cheatcode.co/docs/joystick/test/load',
    });
    
    return null;
  }
  
  return uncachedImport(buildPath, options);
};

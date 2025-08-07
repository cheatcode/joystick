import os from 'os';
import { execSync } from 'child_process';

const get_architecture = () => {
  // Check if running under Rosetta emulation on macOS
  if (os.platform() === 'darwin') {
    // Check if explicitly running under x86_64 architecture
    if (process.env.ARCHPREFERENCE === 'i386' || 
        process.env.ARCHPREFERENCE === 'x86_64' ||
        process.arch === 'x64') {
      return 'x86_64';
    }
    
    // Check if process was started with arch command
    try {
      const result = execSync('sysctl -n sysctl.proc_translated 2>/dev/null || echo 0', { encoding: 'utf8' }).trim();
      if (result === '1') {
        return 'x86_64';
      }
    } catch (error) {
      // Ignore errors, fall back to os.arch()
    }
    
    // Additional check: try to detect if we're running under arch command
    try {
      const uname_result = execSync('uname -m', { encoding: 'utf8' }).trim();
      
      // Check if the system reports x86_64 but Node.js reports arm64 (Rosetta case)
      if (uname_result === 'x86_64' && os.arch() === 'arm64') {
        return 'x86_64';
      }
    } catch (error) {
      // Ignore errors, fall back to os.arch()
    }
  }

  const arch = os.arch();
  if (arch === 'arm64') return 'arm64';
  if (arch === 'x64') return 'x86_64';
  throw new Error(`Unsupported architecture: ${arch}`);
};

export default get_architecture;

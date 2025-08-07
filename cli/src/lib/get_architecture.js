import os from 'os';
import { execSync } from 'child_process';

const get_architecture = () => {
  // Debug logging
  console.log('DEBUG: os.platform():', os.platform());
  console.log('DEBUG: os.arch():', os.arch());
  console.log('DEBUG: process.arch:', process.arch);
  console.log('DEBUG: process.env.ARCHPREFERENCE:', process.env.ARCHPREFERENCE);
  
  // Check if running under Rosetta emulation on macOS
  if (os.platform() === 'darwin') {
    // Check if explicitly running under x86_64 architecture
    if (process.env.ARCHPREFERENCE === 'i386' || 
        process.env.ARCHPREFERENCE === 'x86_64' ||
        process.arch === 'x64') {
      console.log('DEBUG: Detected x86_64 via environment/process.arch');
      return 'x86_64';
    }
    
    // Check if process was started with arch command
    try {
      const result = execSync('sysctl -n sysctl.proc_translated 2>/dev/null || echo 0', { encoding: 'utf8' }).trim();
      console.log('DEBUG: sysctl.proc_translated result:', result);
      if (result === '1') {
        console.log('DEBUG: Detected x86_64 via Rosetta translation');
        return 'x86_64';
      }
    } catch (error) {
      console.log('DEBUG: sysctl command failed:', error.message);
    }
    
    // Additional check: try to detect if we're running under arch command
    try {
      const uname_result = execSync('uname -m', { encoding: 'utf8' }).trim();
      console.log('DEBUG: uname -m result:', uname_result);
      
      // Check if the system reports x86_64 but Node.js reports arm64 (Rosetta case)
      if (uname_result === 'x86_64' && os.arch() === 'arm64') {
        console.log('DEBUG: Detected x86_64 via uname mismatch with os.arch()');
        return 'x86_64';
      }
    } catch (error) {
      console.log('DEBUG: uname command failed:', error.message);
    }
  }

  const arch = os.arch();
  console.log('DEBUG: Falling back to os.arch():', arch);
  if (arch === 'arm64') return 'arm64';
  if (arch === 'x64') return 'x86_64';
  throw new Error(`Unsupported architecture: ${arch}`);
};

export default get_architecture;

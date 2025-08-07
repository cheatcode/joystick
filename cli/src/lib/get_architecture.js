import os from 'os';

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
      const { execSync } = require('child_process');
      const result = execSync('sysctl -n sysctl.proc_translated 2>/dev/null || echo 0', { encoding: 'utf8' }).trim();
      if (result === '1') {
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

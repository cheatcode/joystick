import os from 'os';
import mongodb_macos from './mongodb/installers/macos.js';
import mongodb_windows from './mongodb/installers/windows.js';
import mongodb_linux from './mongodb/installers/linux.js';

const installers = {
  macos: {
    mongodb: mongodb_macos,
  },
  windows: {
    mongodb: mongodb_windows,
  },
  linux: {
    mongodb: mongodb_linux,
  },
};

const download_database_binary = (database_name = '') => {
  const platform = os.platform();
  const installer = installers[platform] && installers[platform][database_name];

  if (installer) {
    installer();
  } else {
    console.warn(`${database_name} not supported on ${platform}`);
  }
};

export default download_database_binary;
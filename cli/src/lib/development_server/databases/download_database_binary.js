import install_database from './installer.js';

const download_database_binary = async (database_name = '') => {
  try {
    await install_database(database_name);
  } catch (error) {
    console.warn(`Failed to install ${database_name}: ${error.message}`);
  }
};

export default download_database_binary;

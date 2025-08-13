import development_server from "../../lib/development_server/index.js";
import load_settings from "../../lib/load_settings.js";
import download_database_binary from "../../lib/development_server/databases/download_database_binary.js";
import cli_log from "../../lib/cli_log.js";
import Loader from "../../lib/loader.js";

const install_missing_databases = async (settings = {}) => {
  const required_databases = settings?.config?.databases?.map((database = {}) => {
    return database?.provider;
  });

  if (required_databases?.length > 0) {
    const loader = new Loader();
    loader.print("Checking database installations...");
    
    for (let i = 0; i < required_databases?.length; i += 1) {
      const provider_name = required_databases[i];
      try {
        await download_database_binary(provider_name);
      } catch (error) {
        cli_log(`Failed to install ${provider_name} database: ${error.message}`, {
          level: "danger",
          docs: "https://cheatcode.co/docs/joystick/databases",
        });
        process.exit(1);
      }
    }
  }
};

const test = async (args = {}, options = {}) => {
  // Load test settings to check for required databases
  const { settings } = await load_settings('test');
  
  // Ensure databases are installed before starting test server
  await install_missing_databases(settings);
  
  await development_server({
    environment: 'test',
    process,
    port: 1977,
    watch: options?.watch,
  });
};

export default test;

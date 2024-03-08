import load_settings from "../settings/load.js";

const get_target_database_connection = (database_type = 'users') => {
  const settings = load_settings();
  const databases = settings?.config?.databases || [];
  const target_database_index = databases.findIndex((database) => !!database[database_type]);
  const target_database_in_settings = databases[target_database_index];
  
  if (!target_database_in_settings) {
    return null;
  }
  
  const has_multiple_of_provider = (databases?.filter((database) => database?.provider === target_database_in_settings?.provider))?.length > 1;
  const database_port = (parseInt(process.env.PORT, 10) + 10) + target_database_index;
  
  return {
    database_type,
    provider: target_database_in_settings?.provider,
    connection: !has_multiple_of_provider ?
      process.databases[target_database_in_settings?.provider] :
      process.databases[target_database_in_settings?.provider][target_database_in_settings?.name || `${target_database_in_settings?.provider}_${database_port}`],
  };
};

export default get_target_database_connection;

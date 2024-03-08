import get_target_database_connection from "../get_target_database_connection.js";
import query_map from "./map.js";

const accounts_query = async (query_name = "", inputs = {}) => {
  const users_database = get_target_database_connection('users');
  const query_map_for_database = users_database && query_map && query_map[users_database?.provider] && query_map[users_database?.provider]?.accounts;
  const query = query_map_for_database && query_map_for_database[query_name];

  if (users_database?.connection && query) {
    const response = await query_map_for_database[query_name](inputs, users_database?.connection);
    return Promise.resolve(response);
  }

  return null;
};

export default accounts_query;

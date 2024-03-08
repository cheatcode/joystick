import get_target_database_connection from "../get_target_database_connection.js";
import query_map from "./map.js";

const sessions_query = async (query_name = "", inputs = {}) => {
  const sessions_database = get_target_database_connection('sessions');
  const query_map_for_database = sessions_database && query_map && query_map[sessions_database?.provider] && query_map[sessions_database?.provider]?.sessions;
  const query = query_map_for_database && query_map_for_database[query_name];

  if (sessions_database?.connection && query) {
    const response = await query_map_for_database[query_name](inputs, sessions_database?.connection);
    return Promise.resolve(response);
  }

  return null;
};

export default sessions_query;

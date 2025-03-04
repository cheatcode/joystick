import build_query_parameters from "./build_query_parameters.js";
import serialize_query_parameters from "../../../lib/serialize_query_parameters.js";

const build_connection_string = (connection = {}) => {
  let connection_string = connection?.srv ? "mongodb+srv://" : "mongodb://";

  if (connection?.username || connection?.password) {
    const user = encodeURIComponent(connection.username || ""); // Encode special characters
    const pass = connection.password ? `:${encodeURIComponent(connection.password)}` : "";
    connection_string += `${user}${pass}@`;
  }

  if (Array.isArray(connection?.hosts)) {
    connection_string += connection.hosts
      .map((host) => (connection?.srv ? host.hostname : `${host.hostname}:${host.port || 27017}`))
      .join(",");
  }

  if (connection?.database) {
    connection_string += `/${connection.database}`;
  }

  const query_parameters = build_query_parameters(connection);
  if (Object.keys(query_parameters || {}).length > 0) {
    connection_string += `?${serialize_query_parameters(query_parameters)}`;
  }

  return connection_string;
};

export default build_connection_string;

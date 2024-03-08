import build_query_parameters from "./build_query_parameters.js";
import serialize_query_parameters from "../../../serialize_query_parameters.js";
import types from "../../../types.js";

const build_connection_string = (connection = {}) => {
  let connection_string = "mongodb://";

  if (connection && (connection.username || connection.password)) {
    connection_string = `${connection_string}${connection.username || connection.password ? `${connection.username || ""}${!!connection.username && !!connection.password ? ':' : ''}${connection.password || ""}@` : ''}`;
  }

  if (connection && connection.hosts && types.is_array(connection.hosts)) {
    connection_string = `${connection_string}${connection.hosts
      .map((host) => `${host.hostname}:${host.port}`)
      .join(",")}`;
  }

  if (connection && connection.database) {
    connection_string = `${connection_string}/${connection.database}`;
  }

  const query_parameters = build_query_parameters(connection);

  if (Object.keys(query_parameters)?.length > 0 ) {
    connection_string = `${connection_string}?${serialize_query_parameters(query_parameters)}`;
  }

  return connection_string;
};

export default build_connection_string;

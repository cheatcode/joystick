import buildQueryParameters from "./buildQueryParameters.js";
import serializeQueryParameters from "../../../../lib/serializeQueryParameters.js";
var buildConnectionString_default = (connection = {}) => {
  let connectionString = "mongodb://";
  if (connection && (connection.username || connection.password)) {
    connectionString = `${connectionString}${connection.username || connection.password ? `${connection.username || ""}${!!connection.username && !!connection.password ? ":" : ""}${connection.password || ""}@` : ""}`;
  }
  if (connection && connection.hosts && Array.isArray(connection.hosts)) {
    connectionString = `${connectionString}${connection.hosts.map((host) => `${host.hostname}:${host.port}`).join(",")}`;
  }
  if (connection && connection.database) {
    connectionString = `${connectionString}/${connection.database}`;
  }
  const queryParameters = buildQueryParameters(connection);
  if (Object.keys(queryParameters)?.length > 0) {
    connectionString = `${connectionString}?${serializeQueryParameters(queryParameters)}`;
  }
  return connectionString;
};
export {
  buildConnectionString_default as default
};

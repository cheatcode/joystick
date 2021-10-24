export default (connection = {}) => {
  let connectionString = "mongodb://";

  if (connection && (connection.username || connection.password)) {
    connectionString = `${connectionString}${connection.username || ""}:${
      connection.password || ""
    }@`;
  }

  if (connection && connection.hosts && Array.isArray(connection.hosts)) {
    connectionString = `${connectionString}${connection.hosts
      .map((host) => `${host.hostname}:${host.port}`)
      .join(",")}`;
  }

  if (connection && connection.database) {
    connectionString = `${connectionString}/${connection.database}`;
  }

  return connectionString;
};

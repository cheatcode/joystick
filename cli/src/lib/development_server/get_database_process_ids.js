const get_database_process_ids = () => {
  const database_process_ids = [];
  const databases = Object.entries(process._databases || {});

  for (let i = 0; i < databases?.length; i += 1) {
    const [_provider, provider_connection] = databases[i];

    if (provider_connection?.pid) {
      database_process_ids.push(provider_connection.pid);
    }

    if (!provider_connection?.pid) {
      const provider_connections = Object.entries(provider_connection);

      for (let pc = 0; pc < provider_connections?.length; pc += 1) {
        const [_connection_name, connection] = provider_connections[pc];

        if (connection?.pid) {
          database_process_ids.push(connection.pid);
        }
      }
    }
  }

  return database_process_ids;
};

export default get_database_process_ids;
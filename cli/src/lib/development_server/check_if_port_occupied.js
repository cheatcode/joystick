import net from 'net';

const reset_client = (client = {}) => {
  client.end();
  client.destroy();
  client.unref();  
};

const check_if_port_occupied = (port = 2600) => {
  return new Promise((resolve) => {
    const client = new net.Socket();

    // NOTE: This is inverted. If we can connect, the port is occupied. If we can't, the port is free.
    client.once('connect', () => {
      reset_client(client);
      resolve(true);
    });

    client.once('error', () => {
      reset_client(client);
      resolve(false);
    });

    client.connect({
      port,
      host: '127.0.0.1',
    }, function() {});
  });
};

export default check_if_port_occupied;

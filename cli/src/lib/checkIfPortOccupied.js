import net from 'net';

const resetClient = (client = {}) => {
  client.end();
  client.destroy();
  client.unref();  
};

export default (port = 2600) => {
  return new Promise((resolve) => {
    const client = new net.Socket();

    // NOTE: This is inverted. If we can connect, the port is occupied. If we can't, the port is free.
    client.once('connect', () => {
      resetClient(client);
      resolve(true);
    });

    client.once('error', () => {
      resetClient(client);
      resolve(false);
    });

    client.connect({
      port,
      host: '127.0.0.1',
    }, function() {});
  });
};
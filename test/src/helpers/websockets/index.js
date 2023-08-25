import WebSocket from 'ws';

export default {
  connect: async (websocketEndpoint = '') => {
    return new Promise((resolve) => {
      const ws = new WebSocket(`ws://localhost:${process.env.PORT}/api/_websockets/${websocketEndpoint}`);

      ws.on('open', () => {
        resolve({
          ...ws,
          send: (payload = {}) => {
            return ws.send(JSON.stringify(payload));
          },
        });
      });

      ws.on('error', (error) => {
        reject(error);
      });
    });
  },
};

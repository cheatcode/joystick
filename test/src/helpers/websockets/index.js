import WebSocket from 'ws';

const websockets = {
  connect: async (websocket_endpoint = '') => {
    return new Promise((resolve) => {
      const ws = new WebSocket(`ws://localhost:${process.env.PORT}/api/_websockets/${websocket_endpoint}`);

      ws.on('open', () => {
        resolve({
          ...ws,
          close: () => {
            ws.close();
          },
          send: (payload = {}) => {
            ws.send(JSON.stringify(payload));
          },
        });
      });

      ws.on('error', (error) => {
        reject(error);
      });
    });
  },
};

export default websockets;

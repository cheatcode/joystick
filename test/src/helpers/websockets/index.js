import WebSocket from 'ws';
import get_test_port from '../../lib/get_test_port.js';

const websockets = {
  connect: async (websocket_endpoint = '') => {
    return new Promise((resolve) => {
      const ws = new WebSocket(`ws://localhost:${get_test_port()}/api/_websockets/${websocket_endpoint}`);

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

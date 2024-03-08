import fs from 'fs';
import node_path_polyfills from '../../lib/node_path_polyfills.js';

const { readFile } = fs.promises;
const hmr_client_script = await readFile(`${node_path_polyfills?.__package}/app/browser/hmr_client.js`, 'utf-8');

const hmr_client_middleware = (_req, res) => {
  res.set('Content-Type', 'text/javascript');
  res.send(hmr_client_script);
};

export default hmr_client_middleware;

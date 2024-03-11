import fs from 'fs';
import node_path_polyfills from '../../lib/node_path_polyfills.js';

const { readFile } = fs.promises;
const polyfill = await readFile(`${node_path_polyfills.__package}/app/browser/process_polyfill.js`, 'utf-8');

const process_browser_polyfill_middleware = (_req, res) => {
	res.set('Content-Type', 'text/javascript');
	res.set('Cache-Control', 'public, max-age=31557600');
	res.send(polyfill?.replace('${NODE_ENV}', process.env.NODE_ENV));
};

export default process_browser_polyfill_middleware;

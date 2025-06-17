import { Worker } from 'worker_threads';
import path from 'path';
import { pathToFileURL } from 'url';

const worker = (file_name, worker_data = {}) => {
  return new Promise((resolve, reject) => {
    const worker_path = pathToFileURL(path.join(process.cwd(), 'workers', file_name)).href;

    const worker_instance = new Worker(worker_path, {
      workerData: worker_data,
      type: 'module',
    });

    worker_instance.on('message', resolve);
    worker_instance.on('error', reject);
    worker_instance.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
};

export default worker;

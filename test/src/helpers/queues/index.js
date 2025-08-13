import fetch from 'node-fetch';
import get_test_port from '../../lib/get_test_port.js';

const queues = {
  job: (job_name = '', options = {}) => {
    return fetch(`http://localhost:${get_test_port()}/api/_test/queues`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        queue: options?.queue,
        job: job_name,
        payload: options?.payload,
      }),
    }).then(async (response) => {
      const response_type = response?.headers?.get('content-type');
      const headers =  Object.fromEntries(response.headers.entries());

      if (response_type?.includes('application/json')) {
        return {
          headers,
          body: await response.json(),
        };
      }

      return null;
    })
  },
};

export default queues;

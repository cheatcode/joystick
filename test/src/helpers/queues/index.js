import fetch from 'node-fetch';

export default {
  job: (jobName = '', options = {}) => {
    return fetch(`http://localhost:${process.env.PORT}/api/_test/queues`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        queue: options?.queue,
        job: jobName,
        payload: options?.payload,
      }),
    })
  },
};

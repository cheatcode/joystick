import fetch from 'node-fetch';

const send_instance_data_to_push = async (type = '', data = '') => {
  return fetch(`https://push.cheatcode.co/api/instances/${type}`, {
    method: 'POST',
    headers: {
      'x-push-instance-token': process.env.PUSH_INSTANCE_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type, data }),
  });
};

export default send_instance_data_to_push;

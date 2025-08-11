import fetch from 'node-fetch';

const get_function_calls = async (path = '') => {
  const server = await fetch(
    `http://localhost:${process.env.PORT}/api/_test/process`
  ).then(async (response) => response.json());
  
  let calls = {
    ...(server?.test?.function_calls || {}),
  };

  if (typeof window !== 'undefined') {
    calls = {
      ...calls,
      ...(window?.test?.function_calls || {}),
    };
  }
  
  return path ? calls[path] : calls;
};

export default get_function_calls;

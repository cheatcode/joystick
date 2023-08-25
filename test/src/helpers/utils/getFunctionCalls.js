import fetch from 'node-fetch';

export default async (path = '') => {
  const server = await fetch(
    `http://localhost:${process.env.PORT}/api/_test/process`
  ).then((response) => response.json());
  
  let calls = {
    ...(server?.test?.functionCalls || {}),
    ...(window?.test?.functionCalls || {}),
  };
  
  return path ? calls[path] : calls;
};

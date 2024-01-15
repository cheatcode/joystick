export default (path = '', args = []) => {
  if (process.env.NODE_ENV === 'test') {
    process.test = {
      ...(process.test || {}),
      functionCalls: {
        ...(process?.test?.functionCalls || {}),
        [path]: [
          ...((process?.test?.functionCalls && process?.test?.functionCalls[path]) || []),
          { calledAt: new Date().toISOString(), args },
        ]
      }
    };
  }
};
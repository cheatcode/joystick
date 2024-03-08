const track_function_call = (path = '', args = []) => {
  if (process.env.NODE_ENV === 'test') {
    process.test = {
      ...(process.test || {}),
      function_calls: {
        ...(process?.test?.function_calls || {}),
        [path]: [
          ...((process?.test?.function_calls && process?.test?.function_calls[path]) || []),
          { called_at: new Date().toISOString(), args },
        ]
      }
    };
  }
};

export default track_function_call;

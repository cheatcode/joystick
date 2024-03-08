const track_function_call = (path = '', args = []) => {
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
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
  
  if (typeof window !== 'undefined' && !!window.__joystick_test__) {
    window.test = {
      ...(window.test || {}),
      function_calls: {
        ...(window?.test?.function_calls || {}),
        [path]: [
          ...((window?.test?.function_calls && window?.test?.function_calls[path]) || []),
          { called_at: new Date().toISOString(), args },
        ]
      }
    }; 
  }
};

export default track_function_call;

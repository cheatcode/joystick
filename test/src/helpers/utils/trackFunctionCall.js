export default (path = '', args = []) => {
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
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
  
  if (typeof window !== 'undefined' && !!window.__joystick_test__) {
    window.test = {
      ...(window.test || {}),
      functionCalls: {
        ...(window?.test?.functionCalls || {}),
        [path]: [
          ...((window?.test?.functionCalls && window?.test?.functionCalls[path]) || []),
          { calledAt: new Date().toISOString(), args },
        ]
      }
    }; 
  }
};
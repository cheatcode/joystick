export default (path = '', args = []) => {
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
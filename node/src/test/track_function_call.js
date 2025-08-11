const track_function_call = (path = '', args = []) => {
  if (process.env.NODE_ENV === 'test') {
    // Initialize process.test if it doesn't exist
    if (!process.test) {
      process.test = { function_calls: {} };
    }
    
    // Initialize function_calls if it doesn't exist
    if (!process.test.function_calls) {
      process.test.function_calls = {};
    }
    
    // Initialize the specific path array if it doesn't exist
    if (!process.test.function_calls[path]) {
      process.test.function_calls[path] = [];
    }
    
    // Push the new call directly to avoid spread operation race conditions
    process.test.function_calls[path].push({
      called_at: new Date().toISOString(),
      args
    });
  }
};

export default track_function_call;

import get_function_calls from "./get_function_calls.js";

const function_called = async (path = '') => {
  if (!path) {
    return false;
  }
  
  const function_calls = await get_function_calls(path);
  
  return function_calls && function_calls?.length > 0;
};

export default function_called;

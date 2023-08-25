import getFunctionCalls from "./getFunctionCalls.js";

export default async (path = '') => {
  if (!path) {
    return false;
  }
  
  const functionCalls = await getFunctionCalls(path);
  
  return functionCalls && functionCalls?.length > 0;
};
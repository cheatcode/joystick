export default (context = {}) => {
  const sanitizedContext = { ...context };
  
  if (sanitizedContext?.req) {
    delete sanitizedContext.req;
    sanitizedContext.req = {
      method: context?.req?.method,
      headers: context?.req?.headers,
      url: context?.req?.url,
    };
  }
  
  if (sanitizedContext?.res) {
    delete sanitizedContext.res;
    sanitizedContext.res = {
      method: context?.res?.method,
      headers: context?.res?.headers,
      url: context?.res?.url,
    };
  }
  
  if (sanitizedContext.mongodb) {
    delete sanitizedContext.mongodb;
  }
  
  if (sanitizedContext.postgresql) {
    delete sanitizedContext.postgresql;
  }
  
  if (sanitizedContext.redis) {
    delete sanitizedContext.redis;
  }
  
  if (sanitizedContext._users) {
    delete sanitizedContext._users;
  }
  
  if (sanitizedContext._queues) {
    delete sanitizedContext._queues;
  }
  
  return sanitizedContext;
};
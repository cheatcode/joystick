const get_sanitized_context = (context = {}) => {
  const sanitized_context = { ...context };
  
  if (sanitized_context?.req) {
    delete sanitized_context.req;

    sanitized_context.req = {
      method: context?.req?.method,
      headers: context?.req?.headers,
      url: context?.req?.url,
    };
  }
  
  if (sanitized_context?.res) {
    delete sanitized_context.res;
    
    sanitized_context.res = {
      method: context?.res?.method,
      headers: context?.res?.headers,
      url: context?.res?.url,
    };
  }
  
  if (sanitized_context.mongodb) {
    delete sanitized_context.mongodb;
  }
  
  if (sanitized_context.postgresql) {
    delete sanitized_context.postgresql;
  }
  
  if (sanitized_context.redis) {
    delete sanitized_context.redis;
  }
  
  if (sanitized_context._users) {
    delete sanitized_context._users;
  }
  
  if (sanitized_context._queues) {
    delete sanitized_context._queues;
  }

  return sanitized_context;
};

export default get_sanitized_context;

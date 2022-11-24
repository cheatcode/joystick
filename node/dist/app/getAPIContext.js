import parseDatabasesFromEnvironment from "../lib/parseDatabasesFromEnvironment.js";
var getAPIContext_default = (httpContext = {}, context = null) => {
  return new Promise(async (resolve, reject) => {
    if (typeof context === "function") {
      const compiledContext = await context(httpContext.req, httpContext.res);
      return resolve({
        ...compiledContext,
        ...httpContext?.req?.context || {},
        req: httpContext.req,
        res: httpContext.res,
        ...process.databases || {}
      });
    }
    return resolve({
      ...context,
      ...httpContext?.req?.context || {},
      req: httpContext.req,
      res: httpContext.res,
      ...process.databases || {}
    });
  });
};
export {
  getAPIContext_default as default
};

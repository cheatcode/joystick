import parseDatabasesFromEnvironment from "../lib/parseDatabasesFromEnvironment.js";

export default (httpContext = {}, context = null) => {
  return new Promise(async (resolve, reject) => {
    if (typeof context === "function") {
      const compiledContext = await context(httpContext.req, httpContext.res);

      return resolve({
        ...compiledContext,
        ...(httpContext?.req?.context || {}),
        req: httpContext.req,
        res: httpContext.res,
        ...(process.databases || {}),
      });
    }

    return resolve({
      ...context,
      ...(httpContext?.req?.context || {}),
      req: httpContext.req,
      res: httpContext.res,
      ...(process.databases || {}),
    });
  });
};

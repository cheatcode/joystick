import parseDatabasesFromEnvironment from "../lib/parseDatabasesFromEnvironment.js";

export default (httpContext = {}, context = null) => {
  return new Promise(async (resolve, reject) => {
    if (typeof context === "function") {
      // TODO: Figure out how you want to handle the users system and automatically
      // add them to this context object (e.g., context.user.blah).
      const compiledContext = await context(httpContext.req, httpContext.res);
      return resolve({
        ...compiledContext,
        req: httpContext.req,
        res: httpContext.res,
        ...(process.databases || {}),
      });
    }

    return resolve({
      ...context,
      req: httpContext.req,
      res: httpContext.res,
      ...(process.databases || {}),
    });
  });
};

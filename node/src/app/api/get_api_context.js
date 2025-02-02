const get_api_context = (req = {}, res = {}, api_context = null) => {
  // NOTE: api_context is the optional *global* context defined in the API
  // schema at /api/index.js in an app.
  return new Promise(async (resolve) => {
    console.log({ req, res });
    
    if (typeof api_context === "function") {
      const compiled_api_context = await api_context(req, res);

      return resolve({
        ...compiled_api_context,
        ...(req?.context || {}),
        ...(process.databases || {}),
        req,
        res,
      });
    }

    return resolve({
      ...api_context,
      ...(req?.context || {}),
      ...(process.databases || {}),
      req,
      res,
    });
  });
};

export default get_api_context;

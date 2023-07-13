var sanitizeQueryParameters_default = (req, res, next) => {
  const queryParameters = Object.entries(req?.query);
  const htmlRegex = new RegExp(/<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g);
  for (let i = 0; i < queryParameters?.length; i += 1) {
    const [key, value] = queryParameters[i];
    const keyHTMLMatches = key?.match(htmlRegex);
    const valueHTMLMatches = value?.match(htmlRegex);
    if (keyHTMLMatches?.length > 0 || valueHTMLMatches?.length > 0) {
      delete req.query[key];
    }
  }
  next();
};
export {
  sanitizeQueryParameters_default as default
};

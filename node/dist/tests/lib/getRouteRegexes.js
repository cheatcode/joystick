var getRouteRegexes_default = (routes = []) => {
  return routes.filter(({ regexp }) => {
    const isMiddlewareRoute = String(new RegExp(regexp)) === String(new RegExp(/^\/?(?=\/|$)/i));
    return !isMiddlewareRoute;
  }).map((route) => new RegExp(route.regexp));
};
export {
  getRouteRegexes_default as default
};

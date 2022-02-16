var assertRoutesExistInRegexes_default = (routeRegexes = [], routes = []) => {
  routes.forEach((route) => {
    const hasMatch = routeRegexes.some((routeRegex) => !!route.match(routeRegex));
    expect(hasMatch).toBe(true);
  });
};
export {
  assertRoutesExistInRegexes_default as default
};

const findPatternMatchingURL = (urlParts = [], patterns = []) => {
  let matchingPatterns = patterns;

  for (let i = 0; i < urlParts?.length; i += 1) {
    const currentURLPart = urlParts[i];
    const patternsWithMatchingPartAtIndex = matchingPatterns?.filter((pattern) => {
      const currentPatternPart = pattern?.parts[i];
      return currentPatternPart?.includes(':') || (currentPatternPart === currentURLPart);
    });
    matchingPatterns = patternsWithMatchingPartAtIndex;
  }

  return matchingPatterns;
};

const urlToPartsArray = (url = '') => {
  return url?.split('/')?.filter(((part) => part !== ''))  
};

const parseRoutePattern = (route = '') => {
  const parts = urlToPartsArray(route);

  return {
    isIndex: parts?.length === 0 && route === '/',
    pattern: route,
    parts,
  };
};

export default (url = '', route = '') => {
  const urlParts = urlToPartsArray(url);
  const pattern = parseRoutePattern(route);
  const matchingPatterns = findPatternMatchingURL(urlParts, [pattern]);
  const validMatches = url === '/' ? matchingPatterns?.filter((matchedPattern) => {
    return matchedPattern?.isIndex;
  }) : matchingPatterns;
  const matchingPattern = (validMatches || []).shift();

  return !!matchingPattern;
};
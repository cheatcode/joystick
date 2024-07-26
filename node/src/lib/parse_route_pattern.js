const parse_route_pattern = (pattern, url) => {
  // Split the pattern and URL into segments
  const pattern_segments = pattern.split('/');
  const url_segments = url.split('?')[0].split('/');
  
  // Initialize the result object
  const result = {
    params: {},
    query: {}
  };

  // Parse path parameters
  for (let i = 0; i < pattern_segments.length; i++) {
    if (pattern_segments[i].startsWith(':')) {
      const param_name = pattern_segments[i].slice(1);
      result.params[param_name] = url_segments[i];
    }
  }

  // Parse query parameters
  const query_string = url.split('?')[1];
  if (query_string) {
    const query_pairs = query_string.split('&');
    for (const pair of query_pairs) {
      const [key, value] = pair.split('=');
      result.query[decodeURIComponent(key)] = decodeURIComponent(value || '');
    }
  }

  return result;
};

export default parse_route_pattern;

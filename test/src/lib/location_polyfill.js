const create_location_polyfill = (base_url = 'http://localhost:3000') => {
  const url = new URL(base_url);
  
  const location = {
    origin: url.origin,
    href: url.href,
    protocol: url.protocol,
    host: url.host,
    hostname: url.hostname,
    port: url.port,
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
    
    replace: (new_url) => {
      // Polyfill for location.replace in test environment
      // In a real browser, this would navigate to the new URL
      // In tests, we just update the location object properties
      try {
        const parsed_url = new URL(new_url, location.origin);
        
        // Update all location properties
        location.href = parsed_url.href;
        location.protocol = parsed_url.protocol;
        location.host = parsed_url.host;
        location.hostname = parsed_url.hostname;
        location.port = parsed_url.port;
        location.pathname = parsed_url.pathname;
        location.search = parsed_url.search;
        location.hash = parsed_url.hash;
        
        console.log(`[test] location.replace called: ${new_url}`);
      } catch (error) {
        console.warn('[test] location.replace polyfill error:', error);
      }
    },
    
    assign: (new_url) => {
      // Polyfill for location.assign - same behavior as replace in tests
      location.replace(new_url);
    },
    
    reload: (force_reload = false) => {
      // Polyfill for location.reload - no-op in tests
      console.log(`[test] location.reload called (force: ${force_reload}) - no-op in test environment`);
    },
    
    toString: () => {
      return location.href;
    }
  };
  
  return location;
};

export default create_location_polyfill;

import types from '../../lib/types.js';

const csp_middleware = (_req, res, next, csp_config = null) => {
  if (csp_config && types.is_object(csp_config)) {
    // NOTE: Redefine for each request so it doesn't get stuck in memory.
    const directive_defaults = {
      'base-uri': ["'self'"],
      'child-src': ["'self'"],
      'connect-src': ["'self'", "wss:"],
      'default-src': ["'self'"],
      'font-src': ["'self'"],
      'form-action': ["'self'"],
      'frame-src': ["'self'"],
      'img-src': ["'self'"],
      'manifest-src': ["'self'"],
      'media-src': ["'self'"],
      'object-src': ["'self'"],
      'script-src': ["'self'"],
      'script-src-attr': ["'self'"],
      'script-src-elem': ["'self'"],
      'style-src': ["'self'"],
      'style-src-attr': ["'self'"],
      'style-src-elem': ["'self'"],
      'worker-src': ["'self'"],
    };
    
    if (process.env.NODE_ENV === "development") {
      directive_defaults["script-src"].push("'unsafe-eval'");
      directive_defaults["connect-src"].push("ws:");
    }
    
    const directive_names = Object.keys(directive_defaults || {});
    
    for (let i = 0; i < directive_names?.length; i += 1) {
      const directive = directive_names[i];
      directive_defaults[directive] = [
        ...(directive_defaults[directive] || []),
        ...(csp_config?.unrestrictedOrigins || csp_config?.unrestricted_origins || []),
        ...((csp_config?.directives && csp_config?.directives[directive]) || []),
      ];
    }
    
    const csp = Object.keys(directive_defaults || {}).map((source) => {
      return `${source} ${directive_defaults[source].join(" ")}`;
    })?.join('; ');
    
    res.setHeader('Content-Security-Policy', csp);
  }
  
  next();
};

export default csp_middleware;

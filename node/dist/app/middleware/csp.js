import { isObject } from "../../validation/lib/typeValidators.js";
var csp_default = (req, res, next, config = null) => {
  if (config && isObject(config)) {
    const directiveDefaults = {
      "default-src": ["'self'"],
      "child-src": ["'self'"],
      "connect-src": ["'self'", "wss:"],
      "font-src": ["'self'"],
      "frame-src": ["'self'"],
      "img-src": ["'self'"],
      "manifest-src": ["'self'"],
      "media-src": ["'self'"],
      "object-src": ["'self'"],
      "script-src": ["'self'"],
      "script-src-elem": ["'self'"],
      "script-src-attr": ["'self'"],
      "style-src": ["'self'"],
      "style-src-elem": ["'self'"],
      "style-src-attr": ["'self'"],
      "worker-src": ["'self'"],
      "base-uri": ["'self'"],
      "navigate-to": ["'self'"],
      "form-action": ["'self'"]
    };
    const { unrestrictedOrigins, directives } = config;
    if (process.env.NODE_ENV === "development") {
      directiveDefaults["script-src"].push("'unsafe-eval'");
      directiveDefaults["connect-src"].push("ws:");
    }
    const directiveNames = Object.keys(directiveDefaults);
    for (let i = 0; i < directiveNames?.length; i += 1) {
      const directive = directiveNames[i];
      directiveDefaults[directive] = [
        ...directiveDefaults[directive] || [],
        ...unrestrictedOrigins || [],
        ...directives[directive] || []
      ];
    }
    const csp = Object.keys(directiveDefaults).map((source) => {
      return `${source} ${directiveDefaults[source].join(" ")}`;
    })?.join("; ");
    res.setHeader("Content-Security-Policy", csp);
  }
  next();
};
export {
  csp_default as default
};

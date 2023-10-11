var get_app_domain_default = (provision_server = "production") => {
  return {
    development: "http://localhost:2600",
    staging: "https://staging.push.cheatcode.co",
    production: "https://push.cheatcode.co"
  }[provision_server];
};
export {
  get_app_domain_default as default
};

import providers from "./providers.js";
var getProvidersWithConnectionStatus_default = (user = {}) => {
  return providers.map((provider) => {
    return {
      ...provider,
      connectedAs: {
        // aws: user?.aws ? `Connected as ${login?.user?.aws?.username}` : null,
        digitalOcean: user?.digitalOcean ? `\u2714 Connected as ${user?.digitalOcean?.info?.email}` : null,
        // google: user?.aws ? `Connected as ${login?.user?.aws?.username}` : null,
        // hetzner: user?.aws ? `Connected as ${login?.user?.aws?.username}` : null,
        linode: user?.linode ? `\u2714 Connected as ${user?.linode?.account?.email}` : null,
        // rackspace: user?.aws ? `Connected as ${login?.user?.aws?.username}` : null,
        vultr: user?.vultr ? `\u2714 Connected as ${user?.vultr?.email}` : null
      }[provider?.value] || "\u{1F5D9} Not connected"
    };
  });
};
export {
  getProvidersWithConnectionStatus_default as default
};

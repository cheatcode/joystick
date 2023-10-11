import providers from "./providers.js";
var getProvidersWithConnectionStatus_default = (user = {}) => {
  return providers.map((provider) => {
    return {
      ...provider,
      connectedAs: {
        // aws: user?.aws ? `Connected as ${login?.user?.aws?.username}` : null,
        digitalOcean: user?.oauth?.digitalOcean ? `\u2714 Connected as ${user?.oauth?.digitalOcean?.info?.email}` : null,
        // google: user?.aws ? `Connected as ${login?.user?.aws?.username}` : null,
        // hetzner: user?.aws ? `Connected as ${login?.user?.aws?.username}` : null,
        linode: user?.oauth?.linode ? `\u2714 Connected as ${user?.oauth?.linode?.account?.email}` : null,
        // rackspace: user?.aws ? `Connected as ${login?.user?.aws?.username}` : null,
        vultr: user?.oauth?.vultr ? `\u2714 Connected as ${user?.oauth?.vultr?.email}` : null
      }[provider?.value] || "\u{1F5D9} Not connected"
    };
  });
};
export {
  getProvidersWithConnectionStatus_default as default
};

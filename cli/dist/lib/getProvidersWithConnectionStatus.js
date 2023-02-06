import providers from "./providers.js";
var getProvidersWithConnectionStatus_default = (user = {}) => {
  return providers.map((provider) => {
    return {
      ...provider,
      connectedAs: {
        digitalOcean: user?.digitalOcean ? `\u2714 Connected as ${user?.digitalOcean?.info?.email}` : null,
        linode: user?.linode ? `\u2714 Connected as ${user?.linode?.account?.email}` : null,
        vultr: user?.vultr ? `\u2714 Connected as ${user?.vultr?.email}` : null
      }[provider?.value] || "\u{1F5D9} Not connected"
    };
  });
};
export {
  getProvidersWithConnectionStatus_default as default
};

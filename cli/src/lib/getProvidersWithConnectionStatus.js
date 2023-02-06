import providers from "./providers.js";

export default (user = {}) => {
  return providers.map((provider) => {
    return { 
      ...provider,
      connectedAs: {
        // aws: user?.aws ? `Connected as ${login?.user?.aws?.username}` : null,
        digitalOcean: user?.digitalOcean ? `✔ Connected as ${user?.digitalOcean?.info?.email}` : null,
        // google: user?.aws ? `Connected as ${login?.user?.aws?.username}` : null,
        // hetzner: user?.aws ? `Connected as ${login?.user?.aws?.username}` : null,
        linode: user?.linode ? `✔ Connected as ${user?.linode?.account?.email}` : null,
        // rackspace: user?.aws ? `Connected as ${login?.user?.aws?.username}` : null,
        vultr: user?.vultr ? `✔ Connected as ${user?.vultr?.email}` : null,
      }[provider?.value] || '🗙 Not connected',
    }
  });
};
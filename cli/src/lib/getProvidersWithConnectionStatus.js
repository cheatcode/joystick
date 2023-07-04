import providers from "./providers.js";

export default (user = {}) => {
  return providers.map((provider) => {
    return {
      ...provider,
      connectedAs:
        {
          // aws: user?.aws ? `Connected as ${login?.user?.aws?.username}` : null,
          digitalOcean: user?.oauth?.digitalOcean
            ? `✔ Connected as ${user?.oauth?.digitalOcean?.info?.email}`
            : null,
          // google: user?.aws ? `Connected as ${login?.user?.aws?.username}` : null,
          // hetzner: user?.aws ? `Connected as ${login?.user?.aws?.username}` : null,
          linode: user?.oauth?.linode
            ? `✔ Connected as ${user?.oauth?.linode?.account?.email}`
            : null,
          // rackspace: user?.aws ? `Connected as ${login?.user?.aws?.username}` : null,
          vultr: user?.oauth?.vultr
            ? `✔ Connected as ${user?.oauth?.vultr?.email}`
            : null,
        }[provider?.value] || "🗙 Not connected",
    };
  });
};

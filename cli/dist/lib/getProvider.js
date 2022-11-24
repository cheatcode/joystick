var getProvider_default = (providers = [], provider = "") => {
  return providers.find((providerOption) => {
    return providerOption?.value === provider;
  });
};
export {
  getProvider_default as default
};

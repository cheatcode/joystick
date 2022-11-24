export default (providers = [], provider = '') => {
  return providers.find((providerOption) => {
    return providerOption?.value === provider;
  });
}

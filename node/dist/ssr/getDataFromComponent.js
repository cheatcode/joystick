var getDataFromComponent_default = async (componentInstance = {}, api = {}, browserSafeUser = {}, browserSafeRequest = {}) => {
  try {
    componentInstance.user = browserSafeUser;
    const data = await componentInstance.handleFetchData(api, browserSafeRequest, {}, componentInstance);
    return {
      componentId: componentInstance?.id,
      data
    };
  } catch (exception) {
    throw new Error(`[ssr.getDataFromComponent] ${exception.message}`);
  }
};
export {
  getDataFromComponent_default as default
};

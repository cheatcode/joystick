export default async (
  componentInstance = {},
  api = {},
  browserSafeRequest = {}
) => {
  try {
    const data = await componentInstance.handleFetchData(
      api,
      browserSafeRequest,
      {},
      componentInstance
    );

    return {
      componentId: componentInstance?.id,
      data,
    };
  } catch (exception) {
    throw new Error(`[ssr.getDataFromComponent] ${exception.message}`);
  }
};
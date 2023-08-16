var importFile_default = async (buildPath = "") => {
  const file = await import(buildPath);
  return file?.default;
};
export {
  importFile_default as default
};

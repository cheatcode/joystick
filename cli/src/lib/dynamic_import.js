const dynamic_import = async (path = '') => { 
  const file = await import(process.platform === 'win32' ? `file://${path}` : path);
  return file?.default;
};

export default dynamic_import;

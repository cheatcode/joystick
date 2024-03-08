import get_platform_safe_path from "./get_platform_safe_path.js";

const dynamic_import = async (path = '') => {
  const file = await import(process.platform === 'win32' ? `file://${path}` : path);
  return file?.default;
};

export default dynamic_import;

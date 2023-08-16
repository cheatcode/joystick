export default async (buildPath = "") => {  
  const file = await import(buildPath);
  return file?.default;
};
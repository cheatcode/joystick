const nodeEnvironment = process && process.NODE_ENV;

export const isDevelopment = nodeEnvironment === "development";
export const isProduction = nodeEnvironment === "production";

export default nodeEnvironment;

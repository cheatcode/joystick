const isDevelopment = process.env.NODE_ENV && process.env.NODE_ENV === "development";
const isStaging = process.env.NODE_ENV && process.env.NODE_ENV === "staging";
const isProduction = process.env.NODE_ENV && process.env.NODE_ENV === "production";
export {
  isDevelopment,
  isProduction,
  isStaging
};

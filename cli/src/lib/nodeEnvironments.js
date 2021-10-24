export const isDevelopment =
  process.env.NODE_ENV && process.env.NODE_ENV === "development";

export const isStaging =
  process.env.NODE_ENV && process.env.NODE_ENV === "staging";

export const isProduction =
  process.env.NODE_ENV && process.env.NODE_ENV === "production";

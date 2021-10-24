import cors from "cors";

export default (config = {}, port = "") => {
  return (req, res, next) => {
    const allowedUrls = [
      `http://localhost:${port}`,
      ...(config?.allowedUrls || []),
    ];

    return cors({
      credentials: true,
      origin: function (origin, callback) {
        if (!origin || allowedUrls.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`${origin} not permitted by CORS policy.`));
        }
      },
    })(req, res, next);
  };
};

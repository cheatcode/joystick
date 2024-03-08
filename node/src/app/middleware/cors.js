import cors from "cors";

const cors_middleware = (config = {}, port = "") => {
  return (req, res, next) => {
    const allowed_urls = [
      `http://localhost:${port}`,
      ...(config?.allowedUrls || []),
    ];

    return cors({
      credentials: true,
      origin: function (origin, callback) {
        if (!origin || allowed_urls.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`${origin} not permitted by CORS policy.`));
        }
      },
    })(req, res, next);
  };
};

export default cors_middleware;

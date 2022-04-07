import fs from "fs";
var getSSLCertificates_default = () => {
  const certExists = fs.existsSync("/lib/deploy/certs/cert.pem");
  const keyExists = fs.existsSync("/lib/deploy/certs/key.pem");
  if (process.env.NODE_ENV !== "production" || !certExists || !keyExists) {
    return null;
  }
  return {
    cert: fs.readFileSync("/lib/deploy/certs/cert.pem"),
    key: fs.readFileSync("/lib/deploy/certs/key.pem")
  };
};
export {
  getSSLCertificates_default as default
};

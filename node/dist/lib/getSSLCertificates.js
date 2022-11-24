import fs from "fs";
var getSSLCertificates_default = (ssl = {}) => {
  const deployCertificatePath = "/lib/deploy/certs/cert.pem";
  const deployKeyPath = "/lib/deploy/certs/key.pem";
  const certPath = process.env.IS_JOYSTICK_DEPLOY ? deployCertificatePath : ssl?.cert;
  const keyPath = process.env.IS_JOYSTICK_DEPLOY ? deployKeyPath : ssl?.key;
  const certExists = fs.existsSync(certPath);
  const keyExists = fs.existsSync(keyPath);
  if (process.env.NODE_ENV === "development" || !certExists || !keyExists) {
    return null;
  }
  return {
    cert: fs.readFileSync(certPath),
    key: fs.readFileSync(keyPath)
  };
};
export {
  getSSLCertificates_default as default
};

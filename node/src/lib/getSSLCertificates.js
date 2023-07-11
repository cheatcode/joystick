import fs from 'fs';

export default (ssl = null) => {
  const pushCertificatePath = '/lib/push/certs/cert.pem';
  const pushKeyPath = '/lib/push/certs/key.pem';

  const certPath = process.env.IS_PUSH_DEPLOYED ? pushCertificatePath : (ssl?.cert || null);
  const keyPath = process.env.IS_PUSH_DEPLOYED ? pushKeyPath : (ssl?.key || null);

  const certExists = fs.existsSync(certPath);
  const keyExists = fs.existsSync(keyPath);

  if (process.env.NODE_ENV === 'development' || !certExists || !keyExists) {
    return null;
  }

  return {
    cert: fs.readFileSync(certPath),
    key: fs.readFileSync(keyPath),
  };
};
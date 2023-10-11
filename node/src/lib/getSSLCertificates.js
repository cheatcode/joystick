import fs from 'fs';

export default (ssl = null) => {
  const pushCertificatePath = '/root/push/certs/cert.pem';
  const pushKeyPath = '/root/push/certs/key.pem';

  const certPath = process.env.IS_PUSH_DEPLOYED ? pushCertificatePath : (ssl?.cert || null);
  const keyPath = process.env.IS_PUSH_DEPLOYED ? pushKeyPath : (ssl?.key || null);

  const certExists = fs.existsSync(certPath);
  const keyExists = fs.existsSync(keyPath);

  if (['development', 'test'].includes(process.env.NODE_ENV) || !certExists || !keyExists) {
    return null;
  }

  return {
    cert: fs.readFileSync(certPath),
    key: fs.readFileSync(keyPath),
  };
};
import fs from 'fs';

const get_ssl_certificates = (ssl = null) => {
  const push_certificate_path = '/root/push/certs/cert.pem';
  const push_key_path = '/root/push/certs/key.pem';

  const certificate_path = process.env.IS_PUSH_DEPLOYED ? push_certificate_path : (ssl?.certificate || null);
  const key_path = process.env.IS_PUSH_DEPLOYED ? push_key_path : (ssl?.key || null);

  const certificate_exists = certificate_path && fs.existsSync(certificate_path);
  const key_exists = key_path && fs.existsSync(key_path);

  if (['development', 'test'].includes(process.env.NODE_ENV) || !certificate_exists || !key_exists) {
    return null;
  }

  return {
    cert: fs.readFileSync(certificate_path),
    key: fs.readFileSync(key_path),
  };
};

export default get_ssl_certificates;

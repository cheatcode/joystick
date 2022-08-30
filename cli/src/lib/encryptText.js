import crypto from 'crypto';

export default (data = '', encryptionKey = '') => {
  const initializationVector = crypto.randomBytes(16);
  const hashedEncryptionKey = crypto.createHash('sha256').update(encryptionKey).digest('base64').substring(0, 32);
  const cipher = crypto.createCipheriv('aes256', hashedEncryptionKey, initializationVector);

  let encryptedData = cipher.update(data);
  encryptedData = Buffer.concat([encryptedData, cipher.final()]);
  
  return initializationVector.toString('hex') + ':' + encryptedData.toString('hex');
};

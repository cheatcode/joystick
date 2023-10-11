import crypto from 'crypto';

export default (buffer, key) => {
	const initialization_vector = crypto.randomBytes(16);
	const hashed_encryption_key = crypto.createHash('sha256').update(key).digest('hex').substring(0, 32);
	const cipher = crypto.createCipheriv('aes256', hashed_encryption_key, initialization_vector);
	return Buffer.concat([initialization_vector, cipher.update(buffer), cipher.final()]);
};
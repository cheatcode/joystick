import crypto from 'crypto';

const decrypt_buffer = (buffer, key) => {
	// NOTE: First 16 bytes of buffer are the initialization_vector.
	const initialization_vector = buffer.slice(0, 16);
	const rest_of_buffer = buffer.slice(16);
	const hashed_encryption_key = crypto.createHash('sha256').update(key).digest('hex').substring(0, 32);
	const decipher = crypto.createDecipheriv('aes256', hashed_encryption_key, initialization_vector);
	return Buffer.concat([decipher.update(rest_of_buffer), decipher.final()]);
};

export default decrypt_buffer;

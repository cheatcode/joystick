import crypto from "crypto";
var decrypt_buffer_default = (buffer, key) => {
  const initialization_vector = buffer.slice(0, 16);
  const rest_of_buffer = buffer.slice(16);
  const hashed_encryption_key = crypto.createHash("sha256").update(key).digest("hex").substring(0, 32);
  const decipher = crypto.createDecipheriv("aes256", hashed_encryption_key, initialization_vector);
  return Buffer.concat([decipher.update(rest_of_buffer), decipher.final()]);
};
export {
  decrypt_buffer_default as default
};

import crypto from "crypto";
var encrypt_buffer_default = (buffer, key) => {
  const initialization_vector = crypto.randomBytes(16);
  const hashed_encryption_key = crypto.createHash("sha256").update(key).digest("hex").substring(0, 32);
  const cipher = crypto.createCipheriv("aes256", hashed_encryption_key, initialization_vector);
  return Buffer.concat([initialization_vector, cipher.update(buffer), cipher.final()]);
};
export {
  encrypt_buffer_default as default
};

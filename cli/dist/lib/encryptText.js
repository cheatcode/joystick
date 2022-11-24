import crypto from "crypto";
var encryptText_default = (data = "", encryptionKey = "") => {
  const initializationVector = crypto.randomBytes(16);
  const hashedEncryptionKey = crypto.createHash("sha256").update(encryptionKey).digest("hex").substring(0, 32);
  const cipher = crypto.createCipheriv("aes256", hashedEncryptionKey, initializationVector);
  let encryptedData = cipher.update(Buffer.from(data, "utf-8"));
  encryptedData = Buffer.concat([encryptedData, cipher.final()]);
  return `${initializationVector.toString("hex")}:${encryptedData.toString("hex")}`;
};
export {
  encryptText_default as default
};

import crypto from "crypto";

const algorithm = "aes-256-cbc";
const key = Buffer.from(process.env.CRYPTO_KEY, "utf8");
const iv = Buffer.from(process.env.CRYPTO_IV, "utf8");

// Encrypt function
export const encrypt = (text) => {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text.toString(), "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted; // Return only the encrypted data
};

// Decrypt function
export const decrypt = (encryptedData) => {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted; // Return the decrypted data
};

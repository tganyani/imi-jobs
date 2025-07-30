import CryptoJS from "crypto-js";

const SECRET_KEY: string = process.env.NEXT_PUBLIC_ENCRYPT_SECRET || "default-secret";


// Encrypt message with AES + IV
export function encryptMessage(message: string): string {
  // Use a SHA256-based IV derived from message (not ideal for production — consider using random IVs)
  const ivWords = CryptoJS.SHA256(message).words.slice(0, 4);
  const iv = CryptoJS.lib.WordArray.create(ivWords, 16); // 128-bit IV

  const key = CryptoJS.PBKDF2(SECRET_KEY, CryptoJS.enc.Utf8.parse("my-cypto-salt"), {
    keySize: 256 / 32,
    iterations: 1000,
  });

  const encrypted = CryptoJS.AES.encrypt(message, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const encryptedHex = encrypted.ciphertext.toString(CryptoJS.enc.Hex);
  const ivHex = iv.toString(CryptoJS.enc.Hex);

  return `${ivHex}:${encryptedHex}`;
}

// Decrypt using same secret and IV
export function decryptMessage(encryptedData: string): string {
  const [ivHex, encryptedHex] = encryptedData.split(":");
  if (!ivHex || !encryptedHex) throw new Error("Invalid encrypted data format");

  const iv = CryptoJS.enc.Hex.parse(ivHex);
  const ciphertext = CryptoJS.enc.Hex.parse(encryptedHex);

  const key = CryptoJS.PBKDF2(SECRET_KEY, CryptoJS.enc.Utf8.parse("my-cypto-salt"), {
    keySize: 256 / 32,
    iterations: 1000,
  });

  // Manually create a CipherParams object
  const cipherParams = CryptoJS.lib.CipherParams.create({
    ciphertext,
  });

  const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
}
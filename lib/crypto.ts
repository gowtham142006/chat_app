import CryptoJS from "crypto-js";

const SECRET_KEY = "chat-app-secret-key";

export const encryptMessage = (message: string) => {
  return CryptoJS.AES.encrypt(
    message,
    SECRET_KEY
  ).toString();
};

export const decryptMessage = (cipher: string) => {
  try {
    const bytes = CryptoJS.AES.decrypt(
      cipher,
      SECRET_KEY
    );

    const decrypted = bytes.toString(
      CryptoJS.enc.Utf8
    );

    return decrypted || cipher;
  } catch {
    return cipher;
  }
};
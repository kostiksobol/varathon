var CryptoJS = require('crypto-js');

// Function to generate a random symmetric key
export function generateSymmetricKey(): string {
  return CryptoJS.lib.WordArray.random(32 / 8).toString();
}

// Function to encrypt data using a symmetric key
export function encryptData(data: string, key: string): string {
  const a =  CryptoJS.AES.encrypt(data, key).toString();
  return a;
}

// Function to decrypt data using a symmetric key
export function decryptData(encryptedData: string, key: string): string {
  try {
    const decryptedData = CryptoJS.AES.decrypt(encryptedData, key).toString(CryptoJS.enc.Utf8);
    return decryptedData;
  } catch (error) {
    return '';
  }
}
var CryptoJS = require('crypto-js');
import * as fs from 'fs';

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

export async function readAsText(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      if (event.target && typeof event.target.result === 'string') {
        resolve(event.target.result);
      } else {
        reject(new Error('Failed to read file'));
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsText(file);
  });
}

// export async function encryptFile(inputFile: File, encryptionKey: string): Promise<File> {
//   try {
//     // Read the contents of the input file
//     const fileData = await readAsText(inputFile);

//     // Encrypt the file data using AES-256 and the encryption key
//     const encryptedData = CryptoJS.AES.encrypt(fileData, encryptionKey).toString();

//     // Create a new File object for the encrypted data
//     const encryptedFile = new File([encryptedData], `encrypted_${inputFile.name}`, {
//       type: 'text/plain',
//     });

//     return encryptedFile;
//   } catch (error) {
//     console.error("Encryption failed:", error);
//     throw error;
//   }
// }

// export async function decryptFile(inputFile: File, decryptionKey: string, outputFileType: string): Promise<File> {
//   try {
//     // Read the contents of the input file
//     const fileData = await readAsText(inputFile);

//     // Decrypt the data using AES-256 and the decryption key
//     const decryptedData = CryptoJS.AES.decrypt(fileData, decryptionKey).toString(CryptoJS.enc.Utf8);

//     // Create a new File object for the decrypted data
//     const decryptedFile = new File([decryptedData], `decrypted_${inputFile.name}`, {
//       type: outputFileType,
//     });

//     return decryptedFile;
//   } catch (error) {
//     console.error("Decryption failed:", error);
//     throw error;
//   }
// }
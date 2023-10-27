import { Buffer } from 'buffer';

// Utility function to convert a Uint8Array to a base64 string.
function bufferToBase64(buffer: Uint8Array): string {
  return Buffer.from(buffer).toString('base64');
}

// Utility function to convert a base64 string to a Uint8Array.
function base64ToBuffer(base64: string): Uint8Array {
  return new Uint8Array(Buffer.from(base64, 'base64'));
}

export async function symmetricKeyToString(key: CryptoKey): Promise<string> {
  const keyBuffer = await crypto.subtle.exportKey('raw', key);
  return bufferToBase64(new Uint8Array(keyBuffer));
}

const SYMKEY_SIZE_IN_BYTES = 16;

export async function stringToSymmetricKey(str: string): Promise<CryptoKey> {
  const keyBuffer = base64ToBuffer(str);

  const key = await crypto.subtle.importKey('raw', keyBuffer, {
    name: 'AES-GCM',
    length: SYMKEY_SIZE_IN_BYTES * 8
  }, true, ['encrypt', 'decrypt']);

  return key;
}

export async function createSymmetricKey(): Promise<CryptoKey> {
  const keyData = window.crypto.getRandomValues(new Uint8Array(SYMKEY_SIZE_IN_BYTES));
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt']
  );
  return key;
}

const IV_LENGTH = 12;

export async function encryptText(text: string, symmetricKey: CryptoKey): Promise<string> {
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encoder = new TextEncoder();
    const encodedText = encoder.encode(text);

    const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv, tagLength: 128 },
        symmetricKey,
        encodedText
    );

    const combinedBuffer = new Uint8Array(IV_LENGTH + encryptedBuffer.byteLength);
    combinedBuffer.set(iv);
    combinedBuffer.set(new Uint8Array(encryptedBuffer), IV_LENGTH);
    
    return bufferToBase64(combinedBuffer);
}

export async function decryptText(encryptedText: string, symmetricKey: CryptoKey): Promise<string> {
    const combinedBuffer = base64ToBuffer(encryptedText);
    const iv = combinedBuffer.slice(0, IV_LENGTH);

    const encryptedData = combinedBuffer.slice(IV_LENGTH);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv, tagLength: 128 },
        symmetricKey,
        encryptedData
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
}

export async function encryptFile(file: File, symmetricKey: CryptoKey): Promise<Blob> {
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const fileData = await file.arrayBuffer();
  const encryptedDataBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    symmetricKey,
    fileData
  );

  const combinedBuffer = new Uint8Array(IV_LENGTH + encryptedDataBuffer.byteLength);
  combinedBuffer.set(iv);
  combinedBuffer.set(new Uint8Array(encryptedDataBuffer), IV_LENGTH);

  return new Blob([combinedBuffer], { type: file.type });
}

export async function decryptFile(encryptedBlob: Blob, symmetricKey: CryptoKey, type: string): Promise<File> {
  const encryptedDataWithIv = await encryptedBlob.arrayBuffer();
  const iv = encryptedDataWithIv.slice(0, IV_LENGTH);
  const encryptedData = encryptedDataWithIv.slice(IV_LENGTH);

  const decryptedData = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(iv) },
    symmetricKey,
    encryptedData
  );

  const blob = new Blob([decryptedData], { type: encryptedBlob.type });
  return new File([blob], `decrypted_file`, { type: type });
}




// export async function readAsText(file: File): Promise<string> {
//   return new Promise<string>((resolve, reject) => {
//     const reader = new FileReader();

//     reader.onload = (event) => {
//       if (event.target && typeof event.target.result === 'string') {
//         resolve(event.target.result);
//       } else {
//         reject(new Error('Failed to read file'));
//       }
//     };

//     reader.onerror = (error) => {
//       reject(error);
//     };

//     reader.readAsText(file);
//   });
// }

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
var forge = require('node-forge');

// Function to generate an RSA key pair and return keys as strings
export function generateKeyPair(): { publicKey: string; privateKey: string } {
  const keyPair = forge.pki.rsa.generateKeyPair({ bits: 1024, e: 0x10001 });

  const publicKeyBase64 = forge.pki.publicKeyToPem(keyPair.publicKey);
  const privateKeyBase64 = forge.pki.privateKeyToPem(keyPair.privateKey);

  return {
    publicKey: publicKeyBase64,
    privateKey: privateKeyBase64,
  };
}

// Function to encrypt data using RSA public key
export function encryptDataWithPubKey(publicKey: string, data: string): string {
  const rsaPublicKey = forge.pki.publicKeyFromPem(publicKey);

  let encrypted = rsaPublicKey.encrypt(data, 'RSA-OAEP');

  encrypted = forge.util.encode64(encrypted);

  return encrypted;
}

// Add error handling for decryption failures
export function decryptDataWithPrivKey(privateKey: string, encryptedData: string): string {
  const rsaPrivateKey = forge.pki.privateKeyFromPem(privateKey);

  let encrypted = forge.util.decode64(encryptedData);

  let decrypted = rsaPrivateKey.decrypt(encrypted, 'RSA-OAEP');

  return decrypted
}

export function checkCorrectPrivateAndPublicKeys(privateKeyPem: string, providedPublicKeyPem: string): boolean {
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    const providedPublicKey = forge.pki.publicKeyFromPem(providedPublicKeyPem);
    const data = "This is some data to encrypt";
    const encryptedData = providedPublicKey.encrypt(data);
    const decryptedData = privateKey.decrypt(encryptedData);
    return data === decryptedData;
}

export function fuckDecryptDataWithPrivKey(privateKey: string, encryptedData: string): string {
  const rsaPrivateKey = forge.pki.privateKeyFromPem(privateKey);

  let encrypted = forge.util.decode64(encryptedData);

  let decrypted = rsaPrivateKey.decrypt(encrypted, 'RSA-OAEP');

  return decrypted
}
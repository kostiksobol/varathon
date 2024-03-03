// Utility function to convert a hex string directly to a Uint8Array
function hexStringToUint8Array(hexString: string): Uint8Array {
    return new Uint8Array(hexString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
}

// Function to create HMAC with nonce and secret key
export async function createHMACWithNonce(secretKey: string): Promise<string> {
    const encoder = new TextEncoder();
    // Generate a nonce
    const nonce = crypto.getRandomValues(new Uint8Array(16));
    const keyData = encoder.encode(secretKey);
    const key = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: { name: "SHA-256" } },
        false,
        ["sign"]
    );

    const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        nonce // Sign the nonce directly
    );

    // Convert nonce and signature to hex strings and concatenate
    const signatureHex = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    const nonceHex = Array.from(nonce)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    return nonceHex + signatureHex;
}

// Function to verify HMAC with nonce, concatenated string, and secret key
export async function verifyHMACWithNonce(concatenatedString: string, secretKey: string): Promise<boolean> {
    const nonceHex = concatenatedString.slice(0, 32); // First 32 hex chars are the nonce
    const signatureHex = concatenatedString.slice(32); // The rest is the signature
    const nonce = hexStringToUint8Array(nonceHex);
    const signature = hexStringToUint8Array(signatureHex);

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretKey);
    const key = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: { name: "SHA-256" } },
        false,
        ["verify"]
    );

    const isValid = await crypto.subtle.verify("HMAC", key, signature, nonce);
    return isValid;
}

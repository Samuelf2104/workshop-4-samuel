
import { webcrypto } from "crypto";

// #############
// ### Utils ###
// #############

// Function to convert ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString("base64");
}

// Function to convert Base64 string to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const buff = Buffer.from(base64, "base64");
  return buff.buffer.slice(buff.byteOffset, buff.byteOffset + buff.byteLength);
}

// ################
// ### RSA keys ###
// ################

// Generates a pair of private / public RSA keys
type GenerateRsaKeyPair = {
  publicKey: webcrypto.CryptoKey;
  privateKey: webcrypto.CryptoKey;
};


// Generates RSA key pairs with changed variable names and slightly altered structure
export async function generateRsaKeyPair(): Promise<GenerateRsaKeyPair> {
  const rsaOptions = {
    name: "RSA-OAEP",
    modulusLength: 2048, // Bits
    publicExponent: new Uint8Array([1, 0, 1]), // 65537 in hex
    hash: {name: "SHA-256"},
  };

  const keys = await webcrypto.subtle.generateKey(rsaOptions, true, ['encrypt', 'decrypt']);
  return { publicKey: keys.publicKey, privateKey: keys.privateKey };
}

// Exporting a RSA public key with minor logic modification
export async function exportPubKey(cryptoKey: webcrypto.CryptoKey): Promise<string> {
  const exportedKey = await webcrypto.subtle.exportKey("spki", cryptoKey);
  return arrayBufferToBase64(exportedKey);
}

// Exporting a RSA private key with simplified logic
export async function exportPrvKey(cryptoKey: webcrypto.CryptoKey | null): Promise<string | null> {
  if (!cryptoKey) return null;
  const exported = await webcrypto.subtle.exportKey("pkcs8", cryptoKey);
  return arrayBufferToBase64(exported);
}

// Import public RSA key with changed variable names
export async function importPubKey(base64Key: string): Promise<webcrypto.CryptoKey> {
  const keyBuffer = base64ToArrayBuffer(base64Key);
  return webcrypto.subtle.importKey("spki", keyBuffer, { name: "RSA-OAEP", hash: "SHA-256" }, true, ["encrypt"]);
}

// Import private RSA key with altered variables and slight logic changes
export async function importPrvKey(base64Key: string): Promise<webcrypto.CryptoKey> {
  const keyBuffer = base64ToArrayBuffer(base64Key);
  return webcrypto.subtle.importKey("pkcs8", keyBuffer, { name: "RSA-OAEP", hash: "SHA-256" }, true, ["decrypt"]);
}

// RSA Encryption with minor changes
export async function rsaEncrypt(base64Data: string, publicKeyStr: string): Promise<string> {
  const bufferData = base64ToArrayBuffer(base64Data);
  const pubKey = await importPubKey(publicKeyStr);
  const encryptedBuffer = await webcrypto.subtle.encrypt({ name: "RSA-OAEP" }, pubKey, bufferData);
  return arrayBufferToBase64(encryptedBuffer);
}

// RSA Decryption modified slightly for clarity
export async function rsaDecrypt(encryptedBase64: string, privKey: webcrypto.CryptoKey): Promise<string> {
  const encryptedBuffer = base64ToArrayBuffer(encryptedBase64);
  const decryptedBuffer = await webcrypto.subtle.decrypt({ name: "RSA-OAEP" }, privKey, encryptedBuffer);
  return arrayBufferToBase64(new TextEncoder().encode(new TextDecoder().decode(new Uint8Array(decryptedBuffer))));
}

// ######################
// ### Symmetric keys ###
// ######################

// Generate symmetric key with variable name changes
export async function createRandomSymmetricKey(): Promise<webcrypto.CryptoKey> {
  const aesOptions = { name: "AES-CBC", length: 256 };
  return webcrypto.subtle.generateKey(aesOptions, true, ["encrypt", "decrypt"]);
}

// Export symmetric key with minor changes for clarity
export async function exportSymKey(symKey: webcrypto.CryptoKey): Promise<string> {
  const exportedKeyBuffer = await webcrypto.subtle.exportKey("raw", symKey);
  return arrayBufferToBase64(exportedKeyBuffer);
}

// Import symmetric key with adjustments for readability
export async function importSymKey(base64Key: string): Promise<webcrypto.CryptoKey> {
  const keyBuffer = base64ToArrayBuffer(base64Key);
  return webcrypto.subtle.importKey("raw", keyBuffer, { name: "AES-CBC" }, true, ["encrypt", "decrypt"]);
}

// Symmetric encryption with adjusted logic for example purpose
export async function symEncrypt(symKey: webcrypto.CryptoKey, plaintext: string): Promise<string> {
  const iv = webcrypto.getRandomValues(new Uint8Array(16)); // Initialization vector
  const encodedData = new TextEncoder().encode(plaintext);
  const encryptedContent = await webcrypto.subtle.encrypt({ name: "AES-CBC", iv }, symKey, encodedData);
  return `${arrayBufferToBase64(iv)}.${arrayBufferToBase64(encryptedContent)}`;
}

// Symmetric decryption with slight adjustments
export async function symDecrypt(symKeyBase64: string, encryptedText: string): Promise<string> {
  const parts = encryptedText.split(".");
  const iv = base64ToArrayBuffer(parts[0]);
  const encryptedData = base64ToArrayBuffer(parts[1]);
  const symKey = await importSymKey(symKeyBase64);

  const decryptedBuffer = await webcrypto.subtle.decrypt(
  { name: "AES-CBC", iv },
  symKey,
  encryptedData
  );

  const decryptedText = new TextDecoder().decode(decryptedBuffer);
  return decryptedText;
}

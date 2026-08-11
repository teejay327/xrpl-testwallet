const bytesToBase64 = (bytes) => {
  return btoa(String.fromCharCode(...bytes));
};

const base64ToBytes = (base64) => {
  const binaryString = atob(base64);

  return Uint8Array.from(
    binaryString,
    (character) => character.charCodeAt(0)
  );
};

const encryptSeed = async(seed, key) => {
  const iv = crypto.getRandomValues(new Uint8Array(12));
}

const deriveEncryptionKey = async(password) => {
  const encoder = new TextEncoder();

  const keyMaterial =await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 250_000,
      hash: "SHA-256"
    },
    keyMaterial,
    {
      name: "AES-GCM",
      length: 256
    },
    false,
    ["encrypt", "decrypt"]
  );
};

export {
  bytesToBase64,
  base64ToBytes, 
  encryptSeed,
  deriveEncryptionKey
};
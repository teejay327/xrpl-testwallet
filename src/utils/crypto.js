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

  const seedBytes = new TextEncoder().encode(seed);
  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv
    },
    key,
    seedBytes
  );

  const encryptedBytes = new Uint8Array(encrypted);
  const ciphertext = bytesToBase64(encryptedBytes);

  const ivBase64 = bytesToBase64(iv);

  return {
    ciphertext,
    iv: ivBase64
  };
};

const deriveEncryptionKey = async(password, salt) => {
  const encoder = new TextEncoder();

  const keyMaterial = await crypto.subtle.importKey(
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

const decryptSeed = async(encryptedSeed, key) => {
  const encryptedBytes = base64ToBytes(encryptedSeed.ciphertext);
  const iv = base64ToBytes(encryptedSeed.iv);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv
    },
    key,
    encryptedBytes
  );

  const decryptedSeed = new TextDecoder().decode(decrypted);

  return decryptedSeed;
};

export {
  bytesToBase64,
  base64ToBytes, 
  encryptSeed,
  deriveEncryptionKey,
  decryptSeed
};
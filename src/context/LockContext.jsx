import { createContext, useContext, useState } from 'react';

const LockContext = createContext(null);

const STORAGE_KEYS = {
  hasPassword: "walletHasPassword",
  passwordSalt: "walletPasswordSalt",
  passwordHash: "walletPasswordHash"
};

const bytesToBase64 = (bytes) => {
  return btoa(String.fromCharCode(...bytes));
};

const derivePasswordHash = async(password, salt) => {
  const encoder = new TextEncoder();

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 250_000,
      hash: "SHA-256"
    },
    keyMaterial,
    256
  );

  return bytesToBase64(new Uint8Array(derivedBits));
}

const LockProvider = ({ children }) => {
  const [isLocked, setIsLocked] = useState(true);
  const [hasPassword, setHasPassword] = useState(
    localStorage.getItem(STORAGE_KEYS.hasPassword) === "true"
  );

  const lockWallet = () => {
    setIsLocked(true);
  };

  const unlockWallet = () => {
    setIsLocked(false);
  };

  const createPassword = async(password) => {
    if (password.length < 8) {
      throw new Error("Password must have at least 8 characters");
    }

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const passwordHash = await derivePasswordHash(password, salt);

    localStorage.setItem(STORAGE_KEYS.hasPassword, "true");
    localStorage.setItem(STORAGE_KEYS.passwordSalt, bytesToBase64(salt));
    localStorage.setItem(STORAGE_KEYS.passwordHash, passwordHash);

    setHasPassword(true);
    setIsLocked(false);

  };

  const verifyPassword = () => {

  };

  return (
    <LockContext.Provider
      value = {{
        isLocked,
        hasPassword,
        createPassword,
        verifyPassword,
        lockWallet,
        unlockWallet
      }}
    >
      {children}
    </LockContext.Provider>
  );
};

const useLock = () => {
  const context = useContext(LockContext);

  if (!context) {
    throw new Error("useLock must be used inside LockProvider");
  }

  return context;
};

export { LockProvider, useLock };
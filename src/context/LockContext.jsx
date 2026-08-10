import { createContext, useContext, useState, useEffect } from 'react';
import { bytesToBase64, base64ToBytes } from '../utils/crypto.js';

const LockContext = createContext(null);

const STORAGE_KEYS = {
  hasPassword: "walletHasPassword",
  passwordSalt: "walletPasswordSalt",
  passwordHash: "walletPasswordHash"
};

// Lock the wallet after 5 minutes of inactivity
const AUTO_LOCK_MS = 5 * 60 * 1000;



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
  const [isLocked, setIsLocked] = useState(
    localStorage.getItem(STORAGE_KEYS.hasPassword) === "true"
  );
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

  const verifyPassword = async(password) => {
    const storedSalt = localStorage.getItem(STORAGE_KEYS.passwordSalt);
    const storedHash = localStorage.getItem(STORAGE_KEYS.passwordHash);

    if (!storedSalt || !storedHash) {
      return false;
    }

    const saltBytes = base64ToBytes(storedSalt);
    const passwordHash = await derivePasswordHash(password, saltBytes);

    return passwordHash === storedHash;
  };

  useEffect(() => {
    if (isLocked) {
      return;
    }

    let timer;

    const resetTimer = () => {
      clearTimeout(timer);
    
      timer = setTimeout(() => {
        lockWallet();
      }, AUTO_LOCK_MS);
    };

    resetTimer() ;

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);
    window.addEventListener("touchStart", resetTimer);

    return() => {
      clearTimeout(timer);

      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("touchStart", resetTimer);
    };
  }, [isLocked]);

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
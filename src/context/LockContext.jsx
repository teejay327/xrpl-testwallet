import { createContext, useContext, useState } from 'react';

const LockContext = createContext(null);

const LockProvider = ({ children }) => {
  const [isLocked, setIsLocked] = useState(false);

  const lockWallet = () => {
    setIsLocked(true);
  };

  const unlockWallet = () => {
    setIsLocked(false);
  };

  return (
    <LockContext.Provider
      value = {{
        isLocked,
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
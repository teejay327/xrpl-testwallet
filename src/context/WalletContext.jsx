import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLock } from "./LockContext.jsx";
import { encryptSeed } from "../utils/crypto.js";
import { decryptSeed } from "../utils/crypto.js";

const isLegacySigningAccount = account => Boolean(account?.seed);
const encryptLegacyAccount = async(account, encryptionKey) => {
  if (!account?.seed) return account;

  if (!encryptionKey) {
    throw new Error("Cannot migrate a signing account while the wallet is locked");
  }

  if (account.encryptedSeed) {
    throw new Error("Account contains both seed formats - manual verification required");
  }

  const encryptedSeed = await encryptSeed(account.seed, encryptionKey);
  const { seed, ...accountWithoutSeed } = account;

    return { ...accountWithoutSeed, encryptedSeed};
}

const accountsUnchanged = (originalAccounts, currentAccounts) => {
  if (originalAccounts.length !== currentAccounts.length) {
    return false;
  }

  return originalAccounts.every(
    (account, index) => account === currentAccounts[index]
  );
};

const WalletContext = createContext(null);

const LS_ACCOUNTS = "xrpl_accounts_v1";
const LS_ACTIVE = "xrpl_active_account_v1";

const WalletProvider = ({ children }) => {
  const { encryptionKey } = useLock();
  const [migrationPending, setMigrationPending] = useState(false);

  const [accounts, setAccounts] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(LS_ACCOUNTS) || "[]");
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  });

  const accountsRef = useRef(accounts);
  useEffect(() => {
    accountsRef.current = accounts;
  },[accounts]);

  const [activeId, setActiveId ] = useState(() => {
    const savedActiveId = localStorage.getItem(LS_ACTIVE);

    if (savedActiveId) {
      return savedActiveId
    }

    try {
      const savedAccounts = JSON.parse(
        localStorage.getItem(LS_ACCOUNTS) || "[]"
      );

      return Array.isArray(savedAccounts) 
        ? savedAccounts[0]?.id || null 
        : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const hasLegacyAccounts = accounts.some(isLegacySigningAccount);
    setMigrationPending(hasLegacyAccounts);
  }, [accounts]);

  useEffect(() => {
    if (!migrationPending || !encryptionKey) return;

    let cancelled = false;

    const migrate = async() => {
      const originalAccounts = accountsRef.current;

      try {
        const migratedAccounts = await Promise.all(
          originalAccounts.map((account) => {
            encryptLegacyAccount(account, encryptionKey)
          })
        );

        if (cancelled) return;

        setAccounts((currentAccounts) => {
          if (!accountsUnchanged(originalAccounts, currentAccounts)) {
            console.warn("Accounts changed during migration - skipping stale result");
            return currentAccounts;
          }

          return migratedAccounts;
        });
      } catch(error) {
        if (!cancelled) {
          console.error("Legacy account migration failed", error);
        }
      }
    };

    migrate();

    return() => {
      cancelled  = true;
    }; 
  }, [migrationPending, encryptionKey, accounts]);

  // Persist
  useEffect(() => {
    if (accounts.some(isLegacySigningAccount)) {
      return;
    }

    localStorage.setItem(LS_ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    if (activeId) {
      localStorage.setItem(LS_ACTIVE, activeId);
    } else {
      localStorage.removeItem(LS_ACTIVE);
    }
  }, [activeId]);

  const activeAccount = useMemo(() => {
    return accounts.find((a) => a.id === activeId) || null;
  }, [accounts, activeId]);

  const addAccount = async(account) => {
    let accountToStore = account;

    if (account.seed) {
      if (!encryptionKey) {
        throw new Error("Wallet must be unlocked before storing a signing account");
      }
        
      const encryptedSeed = await encryptSeed(
          account.seed,
          encryptionKey
        );

      const { seed, ...accountWithoutSeed } = account;
        
      accountToStore = {
          ...accountWithoutSeed,
          encryptedSeed
       };
    }
      
    setAccounts((prev) => {
      return [accountToStore, ...prev];
    });

    setActiveId(accountToStore.id); 
  };

  const removeAccount = (id) => {
    setAccounts((prev) => {
      const next = prev.filter((a) => a.id !== id);
      if (id === activeId) {
        setActiveId(next[0]?.id || null);
      }
      return next;
    });
  };

  const selectAccount = (id) => {
    setActiveId(id);
  }
    
  const renameAccount = (id,newLabel) => {
    setAccounts((prev) =>
      prev.map((account) => account.id === id ? { ...account, label: newLabel } : account )
    )
  };

  const exportAccounts = () => {
    const data = JSON.stringify(accounts, null, 2);
    const blob = new Blob([data], { type: "application/json"});
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "xrpl-wallet-backup.json";
    link.click();

    URL.revokeObjectURL(url);
  }

  const importAccounts = async(accountsToImport) => {
    if (!Array.isArray(accountsToImport)) {
      throw new Error("Invalid account import");
    }

    const securedAccounts = await Promise.all(
      accountsToImport.map(async(account) => {
        if (!account || typeof account !== "object") {
          throw new Error("Invalid account record");
        }

        if (typeof account.address !== "string" || !account.address.trim()) {
          throw new Error("Imported account is missing a valid address");
        }

        if (typeof account.label !== "string" || !account.label.trim()) {
          throw new Error("Imported account must have a valid label");
        }

        if (!xrpl.isValidClassicAddress(account.address)) {
          throw new Error("Imported account has an invalid XRPL address");
        }

        if (account.seed && account.encryptedSeed) {
          throw new Error("Acount contains both seed formats - verification required");
        }

        if (account.seed) {
          const wallet = xrpl.Wallet.fromSeed(account.seed);
          if (wallet.classicAddress !== account.address) {
            throw new Error("Imported seed does not match the account address");
          }
          return encryptLegacyAccount(account, encryptionKey);
        }

        if (account.encryptedSeed) {
          if (!encryptionKey) {
            throw new Error("unlock wallet before importing encrypted accounts");
          }

          const decryptedSeed =  await decryptSeed(account.encryptedSeed, encryptionKey);

          const wallet = xrpl.Wallet.fromSeed(decryptedSeed);

          if (wallet.classicAddress !== account.address) {
            throw new Error("Encrypted seed does not match account address");
          }
        }
       
        return account;
      })
    );

    setAccounts((currentAccounts) => {
      const existingAddresses = new Set(
        currentAccounts.map((account) => account.address)
      );
      
      const newAccounts = securedAccounts.filter((account) => {
        if (existingAddresses.has(account.address)) {
          return false;
        }
        
        existingAddresses.add(account.address);
        return true;
      });
      return [...currentAccounts, ...newAccounts];
    });
  };

  return (
    <WalletContext.Provider
      value={{ accounts, activeAccount, activeId, addAccount, removeAccount, selectAccount, renameAccount, exportAccounts, importAccounts }}
    >
      {children}
    </WalletContext.Provider>
  );
};

const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within <WalletProvider>");
  return ctx;
}

export { useWallet };
export default WalletProvider;
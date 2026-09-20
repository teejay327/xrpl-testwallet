import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLock } from "./LockContext.jsx";
import { encryptSeed } from "../utils/crypto.js";

const WalletContext = createContext(null);

const LS_ACCOUNTS = "xrpl_accounts_v1";
const LS_ACTIVE = "xrpl_active_account_v1";

const WalletProvider = ({ children }) => {
  const { encryptionKey } = useLock();

  const [accounts, setAccounts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_ACCOUNTS) || "[]");
    } catch {
      return [];
    }
  });

  const [activeId, setActiveId ] = useState(() => {
    return localStorage.getItem(LS_ACTIVE) || null;
  });

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_ACCOUNTS) || "[]");
      const active = localStorage.getItem(LS_ACTIVE);
      setAccounts(saved);
      setActiveId(active || saved?.[0]?.id || null);
    } catch {
      setAccounts([]);
      setActiveId(null);
    }
  }, []);

  // Persist
  useEffect(() => {
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
    }
   
    setAccounts((prev) => {
      const next = [account, ...prev];
      return next;
    });
      
    setActiveId(account.id);
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

  const importAccounts = (accountsToImport) => {
    setAccounts((currentAccounts) => {
      const existingAddresses = currentAccounts.map((account) => account.address);

      const newAccounts = accountsToImport.filter((account) => {
        return !existingAddresses.includes(account.address);
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
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const WalletContext = createContext(null);

const LS_ACCOUNTS = "xrpl_accounts_v1";
const LS_ACTIVE = "xrpl_active_account_v1";

const WalletProvider = ({ children }) => {
  const [accounts, setAccounts] = useState([]);
  const [activeId, setActiveId ] = useState(null);


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
    if (activeId) localStorage.setItem(LS_ACTIVE, activeId);
  }, [activeId]);

  const activeAccount = useMemo(() => accounts.find((a) => a.id === activeId) 
    || null, [accounts, activeId]);
  
  
  const addAccount = (account) => {
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
    console.log("Selecting Account:", id);
    setActiveId(id);
  }
    

  return (
    <WalletContext.Provider
      value={{ accounts, activeAccount, activeId, addAccount, removeAccount, selectAccount }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within <WalletProvider>");
  return ctx;
}
export default WalletProvider;
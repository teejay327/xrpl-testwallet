import { createContext, useContext, useEffect, useMemo, useState } from "react";

const WalletContext = createContext(null);

const LS_ACCOUNTS = "xrpl_accounts_v1";
const LS_ACTIVE = "xrpl_active-account_v1";

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
    localStorage.setItem(LS_ACCOUNTS, JSON.strongify(accounts));
  }, [accounts]);

  useEffect(() => {
    if (activeId) localStorage.setItem(LS_ACTIVE, activeId);
  }, [activeId]);

  const activeAccount = useMemo(() => accounts.find((a) => a.id === activeId) 
    || null, [accounts, activeId]);
  

};

export default WalletProvider;
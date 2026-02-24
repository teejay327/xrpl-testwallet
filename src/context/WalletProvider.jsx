import { createContext, useContext, useEffect, useMemo, useState } from "react";

const WalletContext = createContext(null);

const LS_ACCOUNTS = "xrpl_accounts_v1";
const LS_ACTIVE = "xrpl_active_account_v1";

const WalletProvider = ({ children }) => {
  const [accounts,setAccounts] = useState([]);
  const [activeId,setActiveId] = useState(null);

  // persist accounts
  useEffect(() => {
    localStorage.setItem(LS_ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  // persist active account
  useEffect(() => {
    if (activeId) {
      localStorage.setItem(LS_ACTIVE, activeId);
    }
  }, [activeId]);

  const activeAccount = useMemo(() => {
    return accounts.find((a) => {
      a.id === activeId || null;
    }, [accounts, activeId]);
  });

  const addAccount = (account) => {
    setAccounts((prev) => [account, ...prev]);
    setActiveId(account.id);
  };

  const removeAccount = (id) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    if (id === activeId) {
      setActiveId(null);
    }
  };

  const selectAccount = (id) => {
    setActiveId(id);
  }

  return (
    <div>
      WalletContext
    </div>
  )
};

export default WalletProvider;
import { useWallet } from "../context/WalletContext.jsx";
import {  useLock } from "../context/LockContext.jsx";
import UnlockScreen from "../pages/UnlockScreen.jsx";
import PasswordSetup from "./PasswordSetup.jsx";

const LockGate = ({ children }) => {
  const { hasPassword, isLocked } = useLock();
  const { accounts } = useWallet();

  const hasAccounts = accounts.length > 0;

  if (hasAccounts && !hasPassword) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-12">
        <div className="mx-auto w-full max-w-md">
          <PasswordSetup
          message="Create a password to protect your existing wallets"
        />
        </div>
      </div>
    )
  }

  if (hasPassword && isLocked) {
    return <UnlockScreen />;
  }
 
  return children;
};

export default LockGate;
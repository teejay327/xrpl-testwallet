import {  useLock } from "../context/LockContext.jsx";
import UnlockScreen from "../pages/UnlockScreen.jsx";

const LockGate = ({ children }) => {
  const { hasPassword, isLocked } = useLock();

  if (hasPassword && isLocked) {
    return <UnlockScreen />;
  }
 
  return children;
};

export default LockGate;
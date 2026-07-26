import { useState } from "react";
import { useLock } from "../context/LockContext.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx"

const UnlockScreen = () => {
  const { verifyPassword, unlockWallet } = useLock();

  const [ password, setPassword ] = useState("");
  const [ error, setError ] = useState("");
  const [ isUnlocking, setIsUnlocking ] = useState(false);

  const handleUnlock = async() => {
    setError("");
    setIsUnlocking(true);

    try {
      const isValid = await verifyPassword(password);

      if (!isValid) {
        setError("Incorrect password");
        setPassword("");
        return;
      }

      unlockWallet();
    } catch(error) {
      console.error("Unlock failed", error);
      setError("Unable to unlock wallet");
    } finally {
      setIsUnlocking(false);    
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-900 p-6">
        <h1 className="text-2xl font-bold text-slate-100">
          Wallet locked
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Enter the password to unlock your wallet
        </p>

        <div className="mt-5">
          <Input 
            type="password"
            value={ password }
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
          />
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <Button 
          className="mt-4 w-full"
          disabled={isUnlocking}
          onClick={handleUnlock}
        >
          {isUnlocking ? "Unlocking ..." : "Unlock wallet"}
        </Button>
      </div>
    </div>
  )
}

export default UnlockScreen;
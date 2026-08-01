import { useState } from "react";
import { useLock } from "../context/LockContext.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Label from "../components/ui/Label.jsx";

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

    <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/90 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-lg">
          🔒
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Wallet locked
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Enter the password to unlock your wallet
          </p>
        </div>
      </div>

        <div className="mt-6">
          <Label htmlFor="unlock-password">
            Password
          </Label>

          <Input 
            id="unlock-password"
            type="password"
            value={ password }
            onChange={(event) => {
              setPassword(event.target.value)
              if (error) setError("");
            }}
            onKeyDown = {(event) => {
              if (event.key === "Enter" && password && !isUnlocking) {
                handleUnlock();
              }
            }}
            placeholder="Enter your password"
            autoComplete="current-password"
            autoFocus
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
  )
}

export default UnlockScreen;
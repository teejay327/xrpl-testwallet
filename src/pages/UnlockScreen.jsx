import { useState } from "react";
import { useLock } from "../context/LockContext.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx"

const UnlockScreen = () => {
  const { verifyPassword, unlockWallet } = useLock();

  const [ password, setPassword ] = useState("");
  const [ error, setError ] = useState("");
  const [ isUnlocking, setIsUnlocking ] = useState(false);

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
            placeholder="Please enter your password"
          />
        </div>

        <Button className="mt-4 w-full">
          Unlock wallet
        </Button>
      </div>
    </div>
  )
}

export default UnlockScreen;
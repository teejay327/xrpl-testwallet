import { useState } from "react";
import { useLock } from "../context/LockContext.jsx";

import Button from "./ui/Button.jsx";
import Input from "./ui/Input.jsx";;
import Label from "./ui/Button.jsx";

const PasswordSetup = ({
  message = "Create a password to protect your wallet",
  onSuccess
}) => {
  const { createPassword } = useLock();

  const [ password, setPassword ] = useState("");
  const [ confirmPassword, setConfirmPassword ] = useState("");
  const [ error, setError ] = useState("");
  const [ creatingPassword, setCreatingPassword ] = useState(false);

  const handleCreatePassword = async() => {
      setError("");

    if (password.length < 8) {
      setError("Password must have at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setCreatingPassword(true);

    try {
      await createPassword(password);

      setPassword("");
      setConfirmPassword("");

      onSuccess?.();
    } catch(err) {
      setError(err?.message || "Unable to create password");
    } finally {
      setCreatingPassword(false);
    }
  }
  
  return (
    <div className="rounded-md border border-amber-500 bg-amber-950/30 p-4">
      <div className="font-semibold text-amber-300">
        Protect your wallet!
      </div>

      <div className="mt-2 text-sm text-slate-300">
        {message}
      </div>

      <div className="mt-4 grid gap-3">
        <div className="grid gap-1">
          <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);

                if (error) {
                  setError("");
                }
              }}                      
              placeholder="At least 8 characters"
            />
          </div>

          <div className="grid gap-1">
            <Label>Confirm password</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                    
                if (error) {
                  setError("");
                }
              }}
              placeholder="Enter the password again"
            />            
          </div>

          {error && (
            <p
              className="text-sm text-red-400"
              role="alert"
            >
              {error}
            </p>
          )}

          <Button
           type="button"
            onClick={handleCreatePassword}
            disabled={creatingPassword}
          >
            {creatingPassword ? "Creating password ..." : "Create password"}
          </Button>
        </div>
      </div>
    );
}

export default PasswordSetup;
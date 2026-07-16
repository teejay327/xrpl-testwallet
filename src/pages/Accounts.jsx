import { useMemo, useState, useEffect, useRef } from "react";
import { useWallet } from "../context/WalletContext.jsx";
import Card, { CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Label from "../components/ui/Label.jsx";
import { getBalance } from "../xrpl/client.js";
import { isValidClassicAddress, Wallet  } from "xrpl";
import { useLock } from "../context/LockContext.jsx";

const short = (s) => (s ? `${s.slice(0,6)}...${s.slice(-6)}` : "");

const Accounts = () => {
const {accounts, activeId, selectAccount, addAccount, removeAccount, renameAccount, exportAccounts, importAccounts } = useWallet();
const [label, setLabel] = useState("");
const [address, setAddress] = useState("");
const [seed,setSeed] = useState("");
const [error, setError] = useState("");
const [revealedId, setRevealedId] = useState(null);
const [copiedId, setCopiedId] = useState(null);
const [copiedAddressId, setCopiedAddressId] = useState(null);
const [balances,setBalances] = useState({});
const [loadingBalances,setLoadingBalances] = useState(false);
const [pendingAccount, setPendingAccount] = useState(null);
const [showPasswordSetup, setShowPasswordSetup] = useState(false);
const [password, setPassword] = useState();
const [confirmPassword, setConfirmPassword] = useState("");
const [creatingPassword, setCreatingPassword] = useState(false);

const fileInputRef = useRef(null);
const { hasPassword, createPassword } = useLock();

const trimmedAddress = address.trim();
const trimmedSeed = seed.trim();
const trimmedLabel = label.trim();

const canAdd = trimmedAddress.length > 0;
const canImport = trimmedSeed.length > 0;

const onClear = () => {
  setLabel("");
  setAddress("");
  setSeed("");
  setError("");
}

const addAccountWithLockCheck = (account) => {
  const isFirstAccount = accounts.length === 0 && !hasPassword;

  if (isFirstAccount) {
    console.log("First account detected - password setup required");
    setPendingAccount(account);
    setShowPasswordSetup(true);
    return;
  }

  addAccount(account);
}

const onAdd = () => {

  const accountToAdd = {
    id: crypto.randomUUID(),
    label: trimmedLabel || "Watch Account",
    address: trimmedAddress
  };

  if (!isValidClassicAddress(trimmedAddress)) {
    setError("Invalid XRPL address - it must be at least 25 characters starting with r");
    return;
  }

setError("");

  addAccountWithLockCheck(accountToAdd);

  onClear();
};

const onGenerate = () => {
    
  const wallet = Wallet.generate();
  
  const accountToAdd = {
    id: crypto.randomUUID(),
    label: trimmedLabel || `Testnet Wallet ${accounts.length + 1}`,
    address: wallet.address,
    seed: wallet.seed
  }

  addAccountWithLockCheck(accountToAdd);

  onClear();
}

const onImport = () => {
  try {
    const wallet = Wallet.fromSeed(trimmedSeed);


    const accountToAdd = {
      id: crypto.randomUUID(),
      label: trimmedLabel || `Imported Wallet ${accounts.length + 1}`,
      address: wallet.address,
      seed: trimmedSeed
    }

    setError("");
    addAccountWithLockCheck(accountToAdd);
    onClear();
  } catch(err) {
    console.error("IMPORT ERROR", err);
    setError("Invalid seed - unable to import wallet.");
  }
}

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      if (trimmedSeed) {
        onImport();
      } else if (trimmedAddress) {
        onAdd();
      }
    };
  };

  const toggleReveal = (id) => {
    setRevealedId((prev) => {
      const next = prev === id ? null : id;
    
      if (next) {
        setTimeout(() => {
          setRevealedId((current) => {
            current === id ? null : current
          });
        }, 10000);
      }
      return next;
    });
  };

  const copySeed = async(seed, id) => {
    try {
      await navigator.clipboard.writeText(seed);
      setCopiedId(id);

      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch(err) {
      console.error("Copy failed:", err);
    }
  }

  const copyAddress = async(address,id) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddressId(id);

      setTimeout(() => {
        setCopiedAddressId(null);
      }, 2000);
    } catch(err) {
      console.error("Copy address failed:", err);
    }
  }

  const handleRename = (account) => {
    const newLabel = window.prompt("Enter new account label:", account.label);

    if (!newLabel) return;
    const trimmedLabel = newLabel.trim();
    if (!trimmedLabel) return;
    renameAccount(account.id, trimmedLabel);
  };

  const handleImport = async(event) => {
    const file = event.target.files?.[0];

    if (!file) return;
    const text = await file.text();
    
    const importedAccounts = JSON.parse(text);
    
    if (!Array.isArray(importedAccounts)) {
      console.error("Imported backup is not an array");
      return;
    }

    console.log("Valid account array:", importedAccounts.length);

    const validAccounts = importedAccounts.filter((account) => {
      return account?.label && account?.address;
    });

    console.log("Valid accounts:", validAccounts.length);

    const existingAddresses = accounts.map((account) => account.address);

    const newAccounts = validAccounts.filter((account) => {
      return !existingAddresses.includes(account.address);
    });

    console.log("New accounts:", newAccounts.length);

    importAccounts(newAccounts);
    console.log("Imported:", newAccounts.length, "new accounts");

    const mergedAccounts = [...accounts, ...newAccounts];
    console.log("Merged accounts:", mergedAccounts.length);
  }

  useEffect(() => {
    const loadBalances = async() => {
      console.log("Loading balances for", accounts.length, "accounts");
      if (accounts.length === 0) {
        setBalances({});
        return;
      }

      setLoadingBalances(true);

      try {
        const results = await Promise.all(
          accounts.map(async (account) => {
            try {
              const balance = await getBalance(account.address);
              console.log("Balance for", account.label, "=", balance);
              return {
                address: account.address,
                balance
              };
            } catch {
              return {
                address: account.address,
                balance: null
              };
            }
          })
        );

        const nextBalances = {};

        results.forEach((item) => {
          nextBalances[item.address] = item.balance;
        });

        setBalances(nextBalances);
        console.log("Balances loaded", nextBalances);
      } finally {
        setLoadingBalances(false);
      }
    };

    loadBalances();
  }, [accounts]);

  const sortedAccounts = [...accounts].sort((a,b) => {
    if (a.id === activeId) return -1;
    if (b.id === activeId) return 1;
    return 0;
  });

  const totalAccounts = accounts.length;
  const signingAccounts = accounts.filter((a) => a.seed).length;
  const watchOnlyAccounts = accounts.filter((a) => !a.seed).length;

  const handleCreatePassword = async() => {
    if (!pendingAccount) {
      setError("No pending account found");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setCreatingPassword(true);
      setError("");

      await createPassword(password);
      addAccount(pendingAccount);

      setPendingAccount(null);
      setShowPasswordSetup(false);
      setPassword("");
      setConfirmPassword("");
    } catch(err) {
      setError(err?.message || "Unable tocreate password");
    } finally {
      setCreatingPassword(false);
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
          <CardDescription>Add a Testnet address and select it as active</CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4">
          <div className="grid gap-1">
            <Label>Label</Label>
            <Input 
              value={label} 
              onChange={(e) => setLabel(e.target.value)} 
              placeholder="Firstname FamilyName"
              onKeyDown={onKeyDown}
            />
          </div>

          <div className="grid gap-1">
            <Label>XRPL Address (watch-only)</Label>
            <Input 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
              placeholder="r1234567..."
              onKeyDown={onKeyDown}
            />
          </div>

          <div className="grid gap-1">
            <Label>Seed (signing wallet import)</Label>
            <Input
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="sEd..."
              onKeyDown={onKeyDown}
            />

            <div className="text-xs text-slate-400">
              Seed state: {seed || "(empty)"}
            </div>
          </div>


          {error && (
            <div className="text-sm text-rose-400">
              {error}
            </div>
          )}

          {showPasswordSetup && (
            <div className="rounded-md border border-amber-500 bg-amber-950/30 p-4">
              <div className="font-semibold text-amber-300">
                Protect your wallet!
              </div>

              <div className="mt-2 text-sm text-slate-300">
                Create a password before adding your first wallet!
              </div>

              <div className="mt-4 grid gap-3">
                <div className="grid gap-1">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                  />
                </div>

                <div className="grid gap-1">
                  <Label>Confirm password</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Enter the password again"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>



        <CardFooter className="flex flex-wrap gap-3">
          <Button onClick={onAdd} disabled={!canAdd}>
            Add watch-only account - can receive XRP but not send.
          </Button>

          <Button variant="secondary" onClick={onGenerate}>
            Generate Testnet Wallet
          </Button>

          <Button variant="secondary" onClick={onImport}>
            Import by Seed
          </Button>

          <Button variant="ghost" onClick={onClear}>
            Clear
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Wallet statistics</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid max-w-xs grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-sm">
              <span className="text-slate-400">Total accounts</span>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-100">
                {totalAccounts}
              </span>
  
              <span className="text-slate-400">Can send</span>
              <span className="rounded-full bg-emerald-500/10 px-2 py--0.5 text-xs text-emerald-300">
                {signingAccounts}
              </span>

              <span className="text-slate-400">Watch only</span>
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-300">
                {watchOnlyAccounts}
              </span>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 flex justify-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={exportAccounts}
        >
          Export Wallets
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          Import Wallets
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImport}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Saved accounts</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-2">
          { accounts.length === 0 && (
            <div className="text-sm text-slate-300">
              No accounts yet - please add, generate, or import one by seed.
            </div>
          )}

          {sortedAccounts.map((a) => {
            const active = a.id === activeId;

            return(
              <div
                key={a.id}
                className={
                  "flex items-center justify-between rounded-lg border p-3 " +
                  (active ? "border-emerald-500/60 bg-emerald-500/10" : "border-slate-800 bg-slate-900/30")
                }
              >
                <button
                  type="button"
                  className="text-left"
                  onClick={() => selectAccount(a.id)}
                  title="Select this account"
                >
                  <div className="flex items-center gap-2 font-semibold text-slate-100">
                    <span>{a.label} </span>
                    
                    {active && (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 
                        text-[10px] font-medium text-emerald-300 ring-1 ring-emerald-500/30">
                        Active
                      </span>
                    )}

                    {a.seed ? (
                      <span className="text-emerald-400 text-[10px] border border-emerald-500/40 px-1 rounded">
                        Can send
                      </span>
                    ): (
                      <span className="text-amber-400 text-[10px] border border-amber-500/40 px-1 rounded">
                        Watch only
                      </span>
                    )}            
                  </div>

                  <div className="text-xs text-slate-300">{short(a.address)}</div>


                  <div className="mt-1 text-xs text-slate-400">
                    Balance:{" "}
                    {loadingBalances
                      ? "Loading..."
                      : balances[a.address] !== null && balances[a.address] !== undefined
                      ? `${Number(balances[a.address]).toFixed(2)} XRP`
                      : "Unavailable"
                    }
                  </div>

                  {a.seed && revealedId === a.id && (
                    <div className="mt-2 rounded-md border border-amber-500/30 bg-amber-500/10 
                      p-2 text-xs break-all text-amber-200">
                        {a.seed}
                    </div>
                  )}

                  {a.seed && (
                    <div className="mt-1 text-[11px] text-amber-400">
                      Generated in app
                    </div>
                  )}
                </button>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    className="text-emerald-400 hover:text-emerald-200 text-xs transition"
                    onClick={() => copyAddress(a.address, a.id)}
                  >
                    {copiedAddressId === a.id ? "Copied!" : "Copy address"}
                  </button>

                  {a.seed && (
                    <>
                      <button
                        type="button"
                        className="text-xs text-amber-400 hover:text-amber-200"
                        onClick={() => toggleReveal(a.id)}
                      >
                        {revealedId === a.id ? "Hide seed" : "Reveal seed"}
                      </button>

                      <button
                        type="button"
                        className="text-xs text-amber-400 hover:text-amber-200"
                        onClick={() => copySeed(a.seed, a.id)}
                      >
                        {copiedId === a.id ? "Copied!" : "Copy seed"}
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    className="text-xs text-slate-300 hover:text-slate-200"
                    onClick={() => handleRename(a)}
                  >
                    Rename
                  </button>

                  <button 
                    type="button" 
                    className="text-xs text-slate-500 hover:text-rose-300 transition"
                    onClick={() => {
                      if (window.confirm(`Remove ${a.label}?`)) {
                        removeAccount(a.id);
                      }
                    }} 
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </CardContent>  
      </Card>
    </div>
  )
}

export default Accounts;
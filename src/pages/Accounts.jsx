import { useMemo, useState } from "react";
import { useWallet } from "../context/WalletContext.jsx";
import Card, { CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Label from "../components/ui/Label.jsx";
import { isValidClassicAddress, Wallet  } from "xrpl";

const short = (s) => (s ? `${s.slice(0,6)}...${s.slice(-6)}` : "");

const Accounts = () => {
  const {accounts, activeId, selectAccount, addAccount, removeAccount} = useWallet();
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");
  const [seed,setSeed] = useState("");
  const [error, setError] = useState("");

  const trimmedAddress = useMemo(() => address.trim(), [address]);
  const trimmedSeed = useMemo(() => address.trim(), [address]);
  const trimmedLabel = useMemo(() => label.trim(), [label]);

  const canAdd = useMemo(() => trimmedAddress.length > 0, [trimmedAddress]);
  const canImport = useMemo(() => trimmedSeed.length > 0, [trimmedSeed]);

  const onClear = () => {
    setLabel("");
    setAddress("");
    setSeed("");
    setError("");
  }

  const onAdd = () => {
    if (!isValidClassicAddress(trimmedAddress)) {
      setError("Invalid XRPL address - it must be at least 25 characters starting with r");
      return;
    }

    setError("");

    addAccount({
      id: crypto.randomUUID(),
      label: trimmedLabel || "Watch Account",
      address: trimmedAddress
    });

    onClear();
  };

  const onGenerate = () => {
    const wallet = Wallet.generate();

    addAccount({
      id: crypto.randomUUID(),
      label: trimmedLabel || `Testnet Wallet ${accounts.length + 1}`,
      address: wallet.address,
      seed: wallet.seed
    });

    onClear();
  }

  const onImport = () => {
    try {
      const wallet = Wallet.fromSeed(trimmedSeed);

      setError("");

      addAccount({
        id: crypto.randomUUID(),
        label: trimmedLabel || `Imported Wallet ${accounts.length + 1}`,
        address: wallet.address,
        seed: trimmedSeed
      });

      onClear();
    } catch(err) {
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
          </div>

          {error && (
            <div className="text-sm text-rose-400">
              {error}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-wrap gap-3">
          <Button onClick={onAdd} disabled={!canAdd}>
            Add watch-only account
          </Button>

          <Button variant="secondary" onClick={onGenerate}>
            Generate Testnet Wallet
          </Button>

          <Button variant="secondary" onClick={onImport} disabled={!canImport}>
            Import by Seed
          </Button>

          <Button variant="ghost" onClick={onClear}>
            Clear
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saved accounts</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-2">
          { accounts.length === 0 && (
            <div className="text-sm text-slate-300">
              No accounts yet - please add one, generate one or import one by seed.
            </div>
          )}

          {accounts.map((a) => {
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
                    
                    {active && <span className="text-emerald-400 text-xs">(active)</span>}  

                    {a.seed ? (
                      <span className="text-emerald-400 text-[10px] border border-emerald-500/40 px-1 rounded">
                        signing
                      </span>
                    ): (
                      <span className="text-amber-400 text-[10px] border border-amber-500/40 px-1 rounded">
                        watch
                      </span>
                    )}            
                  </div>

                  <div className="text-xs text-slate-300">{short(a.address)}</div>

                  {a.seed && (
                    <div className="mt-1 text-[11px] text-amber-400">
                      Generated in app
                    </div>
                  )}
                </button>

                <div className="flex flex-items-center gap-3">
                  <button
                    type="button"
                    className="text-emerald-400 hover:text-emerald-200 text-xs"
                    onClick={() => navigator.clipboard.writeText(a.address)}
                  >
                    Copy address
                  </button>

                  <Button variant="ghost" size="sm" onClick={() => removeAccount(a.id)}>
                    Remove
                  </Button>
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
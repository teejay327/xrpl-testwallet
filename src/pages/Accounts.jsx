import Card, { CardHeader, CardTitle, CardContent } from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Label from "../components/ui/Label.jsx";
import { useState } from "react";
import { useWallet } from "../context/WalletContext.jsx";

const short = (s) => (s ? `${s.slice(0,6)}...${s.slice(-6)}` : "");

const Accounts = () => {
  const {accounts, activeId, selectAccount, addAccount, removeAccount} = useWallet();
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");
  const onAdd = () => {
    if (!address.trim()) return;
    addAccount({
      id: crypto.randomUUID(),
      label: label.trim() || "Account",
      address: address.trim()
    });
    setLabel("");
    setAddress("");
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4">
          <div className="grid gap-1">
            <Label>Label</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Firstname FamilyName"/>
          </div>
          <div className="grid gap-1">
            <Label>XRPL Address</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="r1234567"/>
          </div>
        </CardContent>

        <CardFooter>
          <Button onClick={onAdd}>Add account</Button>
          <Button variant="secondary" onClick={() => { 
            setLabel("");
            setAddress("");
            }}>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saved accounts</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-2">
          { accounts.length === 0 && (
            <div className="text-sm text-slate-300">No accounts yet - please add one above</div>
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
                  className="text-left"
                  onClick={() => selectAccount(a.id)}
                  title="Select this account"
                >
                  <div className="font-semibold text-slate-100">
                    {a.label} {active && <span className="ml-2 text-emerald-400 text-xs">(active)</span>}  
                  </div>
                  <div className="text-xs text-slate-300">{short(a.address)}</div>
                </button>

                <Button variant="ghost" size="sm" onClick={() => removeAccount(a.id)}>
                  Remove
                </Button>
              </div>
            );
          })}
        </CardContent>  
      </Card>
    </div>
  )
}

export default Accounts;
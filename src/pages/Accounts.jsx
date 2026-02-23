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


        
      </Card>
    </div>
  )
}

export default Accounts;
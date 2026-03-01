import { useEffect, useState } from "react";
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import { getBalance } from "../xrpl/client.js";
import { useWallet } from "../context/WalletContext.jsx";

const short = s => (s ? `${s.slice(0, 6)}...${s.slice(-6)}` : "");

const Dashboard = () => {
  const { activeAccount } = useWallet();

  const [balance,setBalance] = useState(null);
  const [loading,setLoading] = useState(false);
  const [err,setErr] = useState("");

  const refresh = async = () => {
    if (!activeAccount?.address) return;
      try {
        setErr("");
        setLoading(true);
        const b = await getBalance(activeAccount, address);
        setBalance(b);
      } catch (e) {
        setErr(e?.message ?? String(e));
        setBalance(null);
      } finally {
        setLoading(false);
      }
  }

    useEffect(() => {
      // refresh balance for new active account
      refresh();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeAccount?.address]);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="text-slate-300">
          Wallet overview
        </CardContent>
        <CardFooter/>
      </Card>
    </div>
  )
};

export default Dashboard;
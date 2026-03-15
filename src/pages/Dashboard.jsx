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

  const [destination, setDestination ] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState("");
  // Code here ///////////////////////////////////////////////////

  const refresh = async () => {
    if (!activeAccount?.address) return;
      try {
        setErr("");
        setLoading(true);
        const b = await getBalance(activeAccount.address);
        setBalance(b);
      } catch (e) {
        setErr(e?.message ?? String(e));
        setBalance(null);
      } finally {
        setLoading(false);
      }
  }

    useEffect(() => {
      if (!activeAccount?.address) return;
      // refresh balance for new active account
      refresh();

      const timer = setInterval(() => {
        refresh();
      },15000);
      return () => clearInterval(timer);

      // eslint-disable-next-line react-hooks/exhaustive-dep
    }, [activeAccount?.address]);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-3">
          {activeAccount && (
            <div>
              No active account selected. Go to <span className="text-emerald-400">Accounts</span> and choose one
            </div>
          )}
          
          {activeAccount && (
            <>
              <div className="text-sm text-slate-400">Active account</div>
              <div className="font-mono text-sm text-emerald-400">
                {short(activeAccount.address)}
              </div>

              <div className="mt-2 text-sm text-slate-400">Balance</div>
              <div className="text-3xl font-bold">
                {loading ? "loading" : `${balance ?? "-"} XRP`}
              </div>
              <div className="text-xs text-slate-400">
                Auto-refresh every 15 secs
              </div>

              {err && (
                <div className="text-sm text-rose-400">
                  {err}
                </div>
              )}
            </>
          )}
        </CardContent>

        <CardFooter>
          <Button onClick={refresh} disabled={!activeAccount || loading}>
            Refresh
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
};

export default Dashboard;
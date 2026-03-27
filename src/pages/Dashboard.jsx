import { useEffect, useState } from "react";
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Label from "../components/ui/Label.jsx";
import Input from "../components/ui/Input.jsx";
import { getBalance } from "../xrpl/client.js";
import { useWallet } from "../context/WalletContext.jsx";
import sendXrp from "../xrpl/sendXrp.js";
import getTransactions from "../xrpl/history.js";

const short = s => (s ? `${s.slice(0, 6)}...${s.slice(-6)}` : "");

const Dashboard = () => {
  const { activeAccount } = useWallet();

  const [balance,setBalance] = useState(null);
  const [loading,setLoading] = useState(false);
  const [err,setErr] = useState("");

  const [destination, setDestination ] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState("");
  const [txMessage,setTxMessage] = useState("");
  const [txHash,setTxHash] = useState("");

  const [txs,setTxs] = useState([]);
  const [loadingTx,setLoadingTx] = useState(false);

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

  const handleSend = async() => {
    console.log("Sending XRP...");
    if (!activeAccount?.seed) {
      console.error("No seed on active account");
      return;
    }

    try {
      setSending(true);
      setErr("");
      setTxMessage("");
      setTxHash("");

      const result = await sendXrp({
        seed: activeAccount.seed,
        destination,
        amount
      });
      
      console.log("Dashboard: send complete", result);

      setTxMessage(`Sent ${amount} XRP successfully`);
      setTxHash(result?.hash || result?.tx_json?.hash || "");

      await refresh();

      setDestination("");
      setAmount("");

    } catch (err) {
      console.error("SEND ERROR:", err);
      setErr(err?.message || "Transaction failed");
      setTxMessage("");
      setTxHash("");
    } finally {
      setSending(false);
    }
  }

    useEffect(() => {
      if (!activeAccount?.address) return;
      // refresh balance for new active account
      refresh();

      const loadTxs = async() => {
        setLoadingTx(true);

        try {
          const data = await getTransactions(activeAccount.address);
          setTxs(data);
        } catch(err) {
          console.error("TX LOAD ERROR:", err);
        } finally {
          setLoading(false);
        }
      };

      loadTxs();

      const timer = setInterval(() => {
        refresh();
      },30000);
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
          {!activeAccount && (
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

              {!activeAccount?.seed && (
                <div className="mt-2 text-xs text-amber-400">
                  Watch-only account - sending is disabled
                </div>
              )}

              {err && (
                <div className="text-sm text-rose-400">
                  {err}
                </div>
              )}

              <div className="mt-6 grid gap-4">
                <div className="text-sm text-slate-400">
                  Send XRP
                </div>

                <div className="grid gap-1">
                  <Label>Destination Address</Label>
                  <Input
                    placeholder="r1234567..."
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
        
                <div className="grid gap-1">
                  <Label>Amount in XRP</Label>
                  <Input
                    placeholder="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <Button onClick={handleSend} disabled={sending || !activeAccount?.seed}>
                  {!activeAccount?.seed 
                    ? "Watch-only account" 
                    : sending 
                    ? "Sending ..." 
                    : "Send XRP"}
                </Button>

                {txMessage && (
                  <div className="mt-3 rounded=md border border-emerald-500/30 bg-emerald-500/10 p-3"> 
                    <div className="text-sm font-semibold text-emerald-300">
                      {txMessage}
                    </div>

                    {txHash && (
                      <div className="mt-1 text-xs text-slate-300 break-all">
                        Transaction hash: <span className="text-emerald-400">{txHash}</span>
                      </div>
                    )}
                  </div>
                )}
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
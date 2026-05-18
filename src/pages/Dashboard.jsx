import { useEffect, useState } from "react";
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Label from "../components/ui/Label.jsx";
import Input from "../components/ui/Input.jsx";
import { getBalance } from "../xrpl/client.js";
import { useWallet } from "../context/WalletContext.jsx";
import sendXrp from "../xrpl/sendXrp.js";
import getTransactions from "../xrpl/history.js";
import normaliseTransaction from "../lib/normaliseTransaction.js";

const short = s => (s ? `${s.slice(0, 6)}...${s.slice(-6)}` : "");

const Dashboard = () => {
  const { activeAccount } = useWallet();

  const [balance,setBalance] = useState(null);
  const [loading,setLoading] = useState(false);
  const [err,setErr] = useState("");

  const [destination, setDestination ] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [txMessage,setTxMessage] = useState("");
  const [txHash,setTxHash] = useState("");
  const [txType, setTxType] = useState("success");

  const [txs,setTxs] = useState([]);
  const [loadingTx,setLoadingTx] = useState(false);

  const [isFading, setIsFading] = useState(false);

  const isValidXrplAddress = addr => /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(addr.trim());

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

    if (destination.trim() === activeAccount.address) {
      setTxType("error");
      setTxMessage("Cannot send XRP to the active account");
      setTxHash("");
      return;
    }

    if (!isValidXrplAddress(destination)) {
      setTxType("error");
      setTxMessage("Invalid XRPL address");
      setTxHash("");
      return;
    }

    try {
      setSending(true);
      setErr("");
      setTxMessage("");
      setTxHash("");

      const hash = await sendXrp({
        seed: activeAccount.seed,
        destination,
        amount
      });
      
      console.log("Dashboard: send complete", hash);

      setTxType("success");
      setTxMessage(`Sent ${amount} XRP successfully`);
      setTxHash(hash || "");

      await refresh();

      setDestination("");
      setAmount("");

    } catch (err) {
      console.error("SEND ERROR:", err);
      setTxType("error");
      setTxMessage(err?.message || "Transaction failed");
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
          console.log("Fetched TXS:", data);
          setTxs(data);
        } catch(err) {
          console.error("TX LOAD ERROR:", err);
        } finally {
          setLoadingTx(false);
        }
      };

      loadTxs();

      const timer = setInterval(() => {
        refresh();
      },30000);
      return () => clearInterval(timer);

      // eslint-disable-next-line react-hooks/exhaustive-dep
    }, [activeAccount?.address]);

    useEffect(() => {
      if (!txMessage) return;

      setIsFading(false);

      const fadeTimer = setTimeout(() => {
        setIsFading(true);
      },3000);

      const clearTimer = setTimeout(() => {
        setTxMessage("");
        setTxHash("");
        setIsFading(false);
      },4000);

      return() => {
        clearTimeout(fadeTimer);
        clearTimeout(clearTimer);
      } 
    }, [txMessage]);

    useEffect(() => {
      if (txType === "error" && txMessage) {
        setTxMessage("");
        setTxHash("");
        setTxType("success");
      }
    }, [destination, amount]);

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
                Auto-refresh every 30 secs
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
                    placeholder="r123456789..."
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

                <Button onClick={handleSend} 
                  disabled={sending || !activeAccount?.seed || !destination.trim() || !amount
                }>
                  {!activeAccount?.seed 
                    ? "Watch-only account" 
                    : sending 
                    ? "Sending ..." 
                    : "Send XRP"}
                </Button>

                {txMessage && (
                  <div className={`mt-3 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3
                    transition-opacity duration-1000 ${isFading ? "opacity-0" : "opacity-100"
                    } ${
                      txType === "success" 
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border-rose-500/30 bg-rose-500/10 text-rose-300"
                    }`} 
                  >
                    <div>{txMessage}</div>

                    {txType === "success" && txHash && (
                      <div className="mt-1 text-xs text-slate-300 break-all">
                        Transaction hash: {" "}<span className="text-emerald-400">{txHash}</span>
                        
                          <div className="mt-1">
                          <a
                            href={`https://testnet.xrpl.org/transactions/${txHash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-400 underline hover:text-emerald-200"
                          >
                            View on Explorer
                          </a>
                        </div >
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6">
                <div className="mb-2 text-sm text-slate-400">
                  Recent transactions
                </div>

                {loadingTx && (
                  <div className="text-sm text-slate-500">Loading ...</div>
                )}

                {!loadingTx && txs.length === 0 && (
                  <div className="text-sm text-slate-500">
                    No transactions yet
                  </div>
                )}

                <div className="space-y-2">
                  {txs.map((tx) => normaliseTransaction(tx, activeAccount.address))
                    .filter(Boolean)
                    .map((tx,i) => {
                      <div
                        key={tx.hash || i}
                        className="rounded-md border border-slate-800 bg-slate-900/50 p-3 text-xs"
                      >
                        <div className="flex justify-between">
                          <span
                            className={tx.incoming ? "text-emerald-400" : "text-rose-400"}>
                            {tx.direction}
                          </span>

                          <span>{tx.amount}  XRP</span>
                        </div>

                        <div className="mt-1 break-all text-slate-300">
                            {tx.counterparty}
                            {tx.timestamp && (
                              <div className="mt-1 text-[10px] text-slate-500">
                                {new Date(tx.timestamp).toLocaleString()}
                              </div>
                            )}
                        </div>                        
                      </div>
                    })
                  }
                </div>
              </div>
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
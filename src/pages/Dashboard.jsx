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
import timeAgo from "../lib/timeAgo.js";

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
  const [txFilter, setTxFilter] = useState("all");

  const [isFading, setIsFading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const isValidXrplAddress = addr => /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(addr.trim());

  const refresh = async () => {
    if (!activeAccount?.address) return;
      try {
        setErr("");
        setLoading(true);
        const balance = await getBalance(activeAccount.address);
        setBalance(balance);
        setLastUpdated(new Date());
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

    const trimmedDestination = destination.trim();
    const numericAmount = Number(amount);

    if (!amount.trim()) {
      setTxType("error");
      setTxMessage("Please enter an amount");
      setTxHash("");
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setTxType("error");
      setTxMessage("Amount must be greater than zero");
      setTxHash("");
      return;
    }

    if (trimmedDestination === activeAccount.address) {
      setTxType("error");
      setTxMessage("Cannot send XRP to the active account");
      setTxHash("");
      return;
    }

    if (!isValidXrplAddress(trimmedDestination)) {
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
        destination: trimmedDestination,
        amount: amount.trim()
      });

      setTxType("success");
      setTxMessage(`Sent ${amount} XRP successfully`);
      setTxHash(hash || "");

      await refresh();

      const data = await getTransactions(activeAccount.address);
      setTxs(data);
      console.log("Transactions");
      console.log(data);

      setDestination("");
      setAmount("");

    } catch (err) {
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
    },4000);

    const clearTimer = setTimeout(() => {
      setTxMessage("");
      setTxHash("");
      setIsFading(false);
    },5000);

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

  const normalisedTxs = txs
    .map((tx) => {
      return normaliseTransaction(tx, activeAccount?.address)
    })
    .filter(Boolean)
    .sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));

  const totalSent = normalisedTxs
    .filter((tx) => !tx.incoming)
    .reduce((sum,tx) => sum + tx.amount,0);

  const totalReceived = normalisedTxs
    .filter(tx => tx.incoming)
    .reduce((sum,tx) => sum + tx.amount,0);

  const netAmount = totalReceived - totalSent;

  const filteredTxs = normalisedTxs.filter((tx) => {
    if (txFilter === "sent") return !tx.incoming;
    if (txFilter === "received") return tx.incoming;
    return true;
  });

  const isSent = getTransactions.type === "sent";
  const amountClass = isSent ? "text-red-400" : "text-emerald-400";
  const amountPrefix = isSent ? "-" : "+";

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
              <div className="mb-6 rounded-md border border-slate-800 bg-slate-900/40 p-3">
                <div className="mb-2 text-xs font-medium text-slate-400">
                  Active wallet
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-100">
                    {activeAccount?.label || "Unnamed wallet"}
                  </span>

                  <span
                    className={
                      activeAccount?.seed
                        ? "rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300 ring-1 ring-emerald-500/30"
                        : "rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-300 ring-1 ring-amber-500/30"
                    }
                  >
                    {activeAccount?.seed ? "Can send" : "Watch only"}
                  </span>
                </div>

                <div className="mt-1 text-xs text-emerald-400">
                  {short(activeAccount.address)}
                </div>
              </div>
              
              <div className="mt-2 text-sm text-slate-400">Balance</div>
                <div className="text-3xl font-bold">
                  {loading ? "loading" : `${balance ?? "-"} XRP`}
                </div>
                <div className="text-xs text-slate-400">
                  Auto-refresh every 30 secs

                  {lastUpdated && (
                    <div className="text-xs text-slate-400">
                      Last updated: {lastUpdated.toLocaleTimeString()}
                    </div>
                  )}
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
                  disabled={sending || !activeAccount?.seed
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
                            href={`https://testnet.xrpl.org/search/${txHash}`}
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

              <div className="mb-4 rounded-md border border-slate-800 bg-slate-900/40 p-3">
                <div className="mb-2 text-xs font-medium text-slte-400">
                  Summary
                </div>

                <div className="space-y-1  text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sent</span>
                    <span className="text-slate-400">
                      {totalSent.toFixed(2)} XRP
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Received</span>
                      <span className="text-slate-400">
                        {totalReceived.toFixed(2)} XRP
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between border-t border-slate-800 pt-1">
                    <span className="text-slate-400">Net amount for this wallet</span>
                    <span className={netAmount >= 0 ? "text-emerald-400" : "text-sky-400"}>
                      {netAmount.toFixed(2)} XRP
                    </span>
                  </div>
                </div>               
              </div>

              <div className="mb-2 flex items-center gap-2">
                <div className="text-sm text-slate-400">
                  Latest transactions
                </div>

                <div className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                  {filteredTxs.length === 10 ? "Latest 10" : filteredTxs.length}
                </div>
              </div>

              <div>
                <div className="mb-3 flex gap-2">
                  {["all","sent","received"].map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setTxFilter(filter)}
                      className={
                        "rounded-full border px-3 py-1 text-xs transition " +
                        (txFilter === filter
                          ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-300"
                          : "border-slate-700 bg-slate-900/40 text-slate-400 hover:text-slate-200")
                      }
                    >
                      {filter === "all" ? "All" : filter === "sent" ? "Sent" : "Received"}
                    </button>
                  ))}
                </div>

                {loadingTx && (
                  <div className="text-sm text-slate-500">Loading ...</div>
                )}

                {!loadingTx && filteredTxs.length === 0 && (
                  <div className="text-xs border rounded-lg border-slate-800 bg-slate-900/30 p-4">
                    <div className="text-sm text-slate-400">
                      No transactions yet
                    </div>
   
                    <div className="mt-1 txt-sm text-slate-400">
                      Send or receive XRP to begin building your transaction history
                    </div>
                  </div>
                )}

                {!loadingTx && filteredTxs.length > 0 && (
                  <div className="space-y-2">
                    {filteredTxs.map((tx,i) => (
                      <div
                        key={tx.hash || i}
                        className="rounded-md border border-slate-800 bg-slate-900/50 p-3 text-xs"
                      >
                        <div className="flex justify-between">
                          <span
                            className={
                              tx.incoming ? "text-emerald-400" : "text-sky-400"
                            }
                          >
                            {tx.incoming ? "↑ Received" : "↓ Sent"}
                          </span>
                          <span>{tx.amount.toFixed(2)} XRP</span>
                        </div>

                        <div className="mt-1 break-all text-slate-300">
                            {tx.counterparty}
                        </div>

                        {tx.timestamp && (
                          <div className="mt-1 text-xs text-slate-500">
                            {timeAgo(tx.timestamp)}
                            {tx.validated && (
                              <span className="ml-1.5 font-medium text-emerald-400">
                                ✓ Validated
                              </span>
                            )}
                          </div>
                        )}

                        {tx.hash && (
                            <a
                              href={`https://testnet.xrpl.org/search/${tx.hash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-400 underline hover:text-emerald-200"
                            >
                              View on XRPL Explorer
                            </a>                                         
                        )}                        
                      </div>
                    ))}
                  </div>
                )}

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
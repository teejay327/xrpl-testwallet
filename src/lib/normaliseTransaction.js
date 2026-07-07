const normaliseTransaction = (rawTx, activeAddress) => {

  const tx = rawTx?.tx_json || rawTx?.tx || rawTx;

//console.log("HASH:", rawTx.hash || tx?.hash);

  if (!tx || tx.TransactionType !== "Payment") return null;

  const amountValue = tx.Amount || tx.DeliverMax;
  const isXrpPayment = typeof amountValue === "string";
  if (!isXrpPayment) return null;

  const incoming = tx.Destination === activeAddress;
  const amount = Number(amountValue)/1_000_000;
  const hash = rawTx?.hash || tx?.hash;

  // console.log("NORMALISED RESULT:", {
  //   hash: tx.hash || rawTx?.hash,
  //   incoming,
  //   direction: incoming ? "Received" : "Sent",
  //   amount,
  //   counterparty: incoming ? tx.Account : tx.Destination,
  //   timestamp: rawTx?.close_time_iso || null
  // });

  return {
    hash,
    incoming,
    direction: incoming ? "Received" : "Sent",
    amount,
    counterparty: incoming ? tx.Account : tx.Destination,
    timestamp: rawTx?.close_time_iso || null,
    validated: rawTx?.validated === true || tx?.validated === true
  };
};

export default normaliseTransaction;
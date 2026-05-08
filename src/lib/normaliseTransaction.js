const normaliseTransaction = (rawTx, activeAddress) => {
  const tx = rawTx?.tx_json || rawTx?.tx || rawTx;

  if (!tx || tx.TransactinType !== "Payment") return null;

  const isXrpPayment = typeof tx.Amount === "string";
  if (!isXrpPayment) return null;

  const incoming = tx.Destination === activeAddress;
  const amount = Number(tx.Amount)/1_000_000;

  return {
    hash: tx.hash || rawTx?.hash,
    incoming,
    direction: incoming ? "Received" : "Sent",
    amount,
    counterparty: incoming ? tx.Account : tx.Destination
  };
};

export default normaliseTransaction;
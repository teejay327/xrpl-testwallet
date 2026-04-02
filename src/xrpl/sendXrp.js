import { Wallet, xrpToDrops } from "xrpl";
import { getClient } from "./client";

const sendXrp = async ({ seed, destination, amount }) => {

  const client = await getClient();

  const wallet = Wallet.fromSeed(seed);

  const payment = {
    TransactionType: "Payment",
    Account: wallet.address,
    Destination: destination,
    Amount: xrpToDrops(amount)
  }

  const prepared = await client.autofill(payment);
  const signed = wallet.sign(prepared);
  const result = await client.submitAndWait(signed.tx_blob);
  console.log("sendXrp: result =", result);

  if (!result?.result?.hash) {
    throw new Error("Transaction failed - no hash returned");
  }
  
  return result.result.hash;

};

export default sendXrp;
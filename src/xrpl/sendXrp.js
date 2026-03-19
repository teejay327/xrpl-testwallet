import { Wallet, xrpToDrops } from "xrpl";
import { getClient } from "./client";

const sendXrp = async ({ seed, destination, amount }) => {

  console.log("sendXrp: start");
  console.log("sendXrp: destination =", destination);
  console.log("sendXrp: amount =", amount);

  const client = await getClient();
  console.log("sendXrp: got client");

  const wallet = Wallet.fromSeed(seed);
  console.log("sendXrp: wallet address =", wallet.address);

  const payment = {
    TransactionType: "Payment",
    Account: wallet.address,
    Destination: destination,
    Amount: xrpToDrops(amount)
  }
  console.log("sendXrp: payment =", payment);

  const prepared = await client.autofill(payment);
  console.log("sendXrp: payment =", payment);

  const signed = wallet.sign(prepared);
  console.log("sendXrp: signed");

  const result = await client.submitAndWait(signed.tx_blob);
  console.log("sendXrp: result =", result);

  return result;

};

export default sendXrp;
import { getClient } from "./client";

const getTransactions = async(address) => {
  const client = await getClient();

  const response = await client.request({
   command: "account_tx",
   account: address,
   ledger_index_min: -1,
   ledger_index_max: -1,
   limit: 10
  });

  return response.result.transactions;
}

export default getTransactions;
import { Client } from "xrpl";

const WS_URL = import.meta.env.VITE_XRPL_WS || "wss://s.altnet.rippletest.net:51233";

let client = null;

const getClient = async () => {
  if (!client) {
    client = new Client(WS_URL);
    await client.connect();
  } else if (!client.isConnected()) {
    await client.connect();
  }
  return client;
}

const getBalance = async(address) => {
  const c = await getClient();
  return await c.getXrpBalance(address);
}

export { getClient, getBalance };
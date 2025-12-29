import "dotenv/config";

function req(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export const config = {
  port: Number(process.env.PORT || 8080),
  mongoUri: req("MONGO_URI"),
  rpcUrl: req("RPC_URL"),
  chainId: Number(req("CHAIN_ID")),
  brokerAddress: req("BROKER_ADDRESS") as `0x${string}`,
  usdxAddress: req("USDX_ADDRESS") as `0x${string}`,
  mystockAddress: req("MYSTOCK_ADDRESS") as `0x${string}`,
  price: Number(req("PRICE_USDX_PER_STOCK")),
  explorerTxBase: process.env.EXPLORER_TX_BASE || "https://sepolia.etherscan.io/tx/",
};

export const cfg = {
  backendUrl: import.meta.env.VITE_BACKEND_URL as string,
  chainId: Number(import.meta.env.VITE_CHAIN_ID),
  usdx: import.meta.env.VITE_USDX_ADDRESS as `0x${string}`,
  mystock: import.meta.env.VITE_MYSTOCK_ADDRESS as `0x${string}`,
  broker: import.meta.env.VITE_BROKER_ADDRESS as `0x${string}`,
  explorerTxBase: (import.meta.env.VITE_EXPLORER_TX_BASE as string) || "https://sepolia.etherscan.io/tx/",
  price: 10, // UI display only, backend is source of truth
};

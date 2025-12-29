import { createPublicClient, http, parseAbiItem, decodeEventLog } from "viem";
import { config } from "../config";

export const publicClient = createPublicClient({
  chain: {
    id: config.chainId,
    name: "custom",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: [config.rpcUrl] } },
  },
  transport: http(config.rpcUrl),
});

// ERC20 Transfer event signature
const transferEvent = parseAbiItem(
  "event Transfer(address indexed from, address indexed to, uint256 value)"
);

export async function waitAndVerifyErc20Transfer(args: {
  txHash: `0x${string}`;
  tokenAddress: `0x${string}`;
  expectedFrom: `0x${string}`;
  expectedTo: `0x${string}`;
  minValue: bigint; // expected value; you can require ==, or >=
}) {
  const receipt = await publicClient.waitForTransactionReceipt({
    hash: args.txHash,
    confirmations: 1,
  });
  if (receipt.status !== "success") {
    throw new Error("Transaction failed");
  }

  // Find matching Transfer log from tokenAddress
  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== args.tokenAddress.toLowerCase()) continue;

    try {
      const decoded = decodeEventLog({
        abi: [transferEvent],
        data: log.data,
        topics: log.topics,
      });

      if (decoded.eventName !== "Transfer") continue;

      const from = (decoded.args.from as string).toLowerCase();
      const to = (decoded.args.to as string).toLowerCase();
      const value = decoded.args.value as bigint;

      if (
        from === args.expectedFrom.toLowerCase() &&
        to === args.expectedTo.toLowerCase() &&
        value >= args.minValue
      ) {
        return { receipt, value };
      }
    } catch {
      // ignore non-matching logs
    }
  }

  throw new Error("No matching ERC20 Transfer found in receipt");
}

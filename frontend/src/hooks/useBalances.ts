import { useReadContract } from "wagmi";
import { erc20Abi } from "../abi/erc20";
import { cfg } from "../config";

export function useBalances(address?: `0x${string}`) {
  const usdx = useReadContract({
    address: cfg.usdx,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const stock = useReadContract({
    address: cfg.mystock,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  return { usdx, stock };
}

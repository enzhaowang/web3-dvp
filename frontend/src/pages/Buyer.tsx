import { useMemo, useState } from "react";
import LoginBox from "../components/LoginBox";
import { useAccount, useWriteContract } from "wagmi";
import { useBalances } from "../hooks/useBalances";
import { cfg } from "../config";
import { erc20Abi } from "../abi/erc20";
import { api } from "../api/client";
import { formatUnits, parseUnits } from "viem";

type Deal = any;

export default function Buyer() {
  const { address } = useAccount();
  const { usdx, stock } = useBalances(address);
  const { writeContractAsync } = useWriteContract();

  const [qty, setQty] = useState("1");
  const [loading, setLoading] = useState("");
  const [deal, setDeal] = useState<Deal | null>(null);

  const usdxStr = useMemo(() => {
    const v = usdx.data ?? 0n;
    return formatUnits(v, 18);
  }, [usdx.data]);

  const stockStr = useMemo(() => {
    const v = stock.data ?? 0n;
    return formatUnits(v, 18);
  }, [stock.data]);

  async function submit() {
    if (!address) throw new Error("connect wallet");
    setLoading("creating deal...");

    // 1) create deal
    const created = await api<{ deal: Deal; brokerAddress: `0x${string}`; price: number }>(
      "/api/deals",
      {
        method: "POST",
        body: JSON.stringify({ buyerAddress: address, stockAmount: qty }),
      }
    );

    setDeal(created.deal);

    // 2) transfer USDX to broker
    // backend computed usdxAmount in wei and stored on deal.usdxAmount
    const usdxAmountWei = BigInt(created.deal.usdxAmount);

    setLoading("sending USDX to broker...");
    const txHash = await writeContractAsync({
      address: cfg.usdx,
      abi: erc20Abi,
      functionName: "transfer",
      args: [cfg.broker, usdxAmountWei],
    });

    setLoading("verifying on backend...");
    const updated = await api<{ deal: Deal }>(`/api/deals/${created.deal._id}/buyerTx`, {
      method: "POST",
      body: JSON.stringify({ txHash }),
    });

    setDeal(updated.deal);
    await usdx.refetch();
    await stock.refetch();
    setLoading("");
  }

  return (
    <div>
      <h2>/buyer</h2>
      <LoginBox />
      <div style={{ marginTop: 12 }}>
        <div>USDX: {usdxStr}</div>
        <div>MyStock: {stockStr}</div>
      </div>

      <div style={{ marginTop: 12, border: "1px solid #eee", padding: 12 }}>
        <div>
          Buy MyStock qty:{" "}
          <input value={qty} onChange={(e) => setQty(e.target.value)} />
        </div>
        <button onClick={submit} disabled={!address || !!loading}>
          Submit Buy (USDX -{'>'} Broker)
        </button>
        {loading && <div style={{ marginTop: 8 }}>⏳ {loading}</div>}
      </div>

      {deal && (
        <div style={{ marginTop: 12 }}>
          <div>Deal ID: {deal._id}</div>
          <div>BuyerTx: {deal.buyerTxHash ? <a href={`${cfg.explorerTxBase}${deal.buyerTxHash}`} target="_blank">tx</a> : "no"}</div>
          <div>Status: {deal.status}</div>
        </div>
      )}
    </div>
  );
}

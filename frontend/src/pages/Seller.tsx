import { useEffect, useState } from "react";
import LoginBox from "../components/LoginBox";
import { useAccount, useWriteContract } from "wagmi";
import { useBalances } from "../hooks/useBalances";
import { cfg } from "../config";
import { erc20Abi } from "../abi/erc20";
import { api } from "../api/client";
import { formatUnits } from "viem";

type Deal = any;

export default function Seller() {
  const { address } = useAccount();
  const { usdx, stock } = useBalances(address);
  const { writeContractAsync } = useWriteContract();

  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState("");

  async function refresh() {
    const res = await api<{ deals: Deal[] }>("/api/deals?status=pending");
    setDeals(res.deals);
  }

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 3000);
    return () => clearInterval(t);
  }, []);

  async function accept(deal: Deal) {
    if (!address) throw new Error("connect wallet");
    setLoading("sending MyStock to broker...");

    const stockAmountWei = BigInt(deal.stockAmount);

    const txHash = await writeContractAsync({
      address: cfg.mystock,
      abi: erc20Abi,
      functionName: "transfer",
      args: [cfg.broker, stockAmountWei],
    });

    setLoading("verifying on backend...");
    await api(`/api/deals/${deal._id}/sellerTx`, {
      method: "POST",
      body: JSON.stringify({ txHash }),
    });

    setLoading("");
    await refresh();
    await usdx.refetch();
    await stock.refetch();
  }

  async function reject(deal: Deal) {
    await api(`/api/deals/${deal._id}/reject`, { method: "POST" });
    await refresh();
  }

  return (
    <div>
      <h2>/seller</h2>
      <LoginBox />

      <div style={{ marginTop: 12 }}>
        <div>USDX: {formatUnits(usdx.data ?? 0n, 18)}</div>
        <div>MyStock: {formatUnits(stock.data ?? 0n, 18)}</div>
      </div>

      <div style={{ marginTop: 12 }}>
        <h3>Pending Deals</h3>
        {loading && <div>⏳ {loading}</div>}
        <table border={1} cellPadding={6}>
          <thead>
            <tr>
              <th>Buyer</th>
              <th>Stock</th>
              <th>USDX</th>
              <th>Buyer funds received</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((d) => (
              <tr key={d._id}>
                <td>{d.buyerAddress}</td>
                <td>{formatUnits(BigInt(d.stockAmount), 18)}</td>
                <td>{formatUnits(BigInt(d.usdxAmount), 18)}</td>
                <td>{d.buyerFundsReceived ? "yes" : "no"}</td>
                <td>
                  <button onClick={() => reject(d)} style={{ marginRight: 8 }}>
                    Reject
                  </button>
                  <button onClick={() => accept(d)} disabled={!!loading}>
                    Accept (MyStock -{'>'} Broker)
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

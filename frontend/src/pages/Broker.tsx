import { useEffect, useState } from "react";
import LoginBox from "../components/LoginBox";
import { useAccount, useWriteContract } from "wagmi";
import { useBalances } from "../hooks/useBalances";
import { cfg } from "../config";
import { erc20Abi } from "../abi/erc20";
import { api } from "../api/client";
import { formatUnits } from "viem";

type Deal = any;

export default function Broker() {
  const { address } = useAccount();
  const { usdx, stock } = useBalances(address);
  const { writeContractAsync } = useWriteContract();

  const [pending, setPending] = useState<Deal[]>([]);
  const [finalized, setFinalized] = useState<Deal[]>([]);
  const [loading, setLoading] = useState("");

  async function refresh() {
    const p = await api<{ deals: Deal[] }>("/api/deals?status=pending");
    const f = await api<{ deals: Deal[] }>("/api/deals?status=finalized");
    setPending(p.deals);
    setFinalized(f.deals);
  }

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 3000);
    return () => clearInterval(t);
  }, []);

  async function execute(deal: Deal) {
    if (!address) throw new Error("connect wallet");
    if (address.toLowerCase() !== cfg.broker.toLowerCase()) {
      alert("Please connect the broker wallet address");
      return;
    }

    if (!deal.buyerFundsReceived || !deal.sellerFundsReceived) return;

    setLoading("Broker sending MyStock to buyer...");
    const tx1 = await writeContractAsync({
      address: cfg.mystock,
      abi: erc20Abi,
      functionName: "transfer",
      args: [deal.buyerAddress, BigInt(deal.stockAmount)],
    });

    setLoading("Broker sending USDX to seller...");
    const tx2 = await writeContractAsync({
      address: cfg.usdx,
      abi: erc20Abi,
      functionName: "transfer",
      args: [deal.sellerAddress, BigInt(deal.usdxAmount)],
    });

    setLoading("Finalizing on backend...");
    await api(`/api/deals/${deal._id}/finalize`, {
      method: "POST",
      body: JSON.stringify({
        brokerToBuyerTxHash: tx1,
        brokerToSellerTxHash: tx2,
      }),
    });

    setLoading("");
    await refresh();
    await usdx.refetch();
    await stock.refetch();
  }

  function txLink(hash: string) {
    return hash ? (
      <a href={`${cfg.explorerTxBase}${hash}`} target="_blank">
        {hash.slice(0, 10)}...
      </a>
    ) : (
      "no"
    );
  }

  return (
    <div>
      <h2>/broker</h2>
      <LoginBox />

      <div style={{ marginTop: 12 }}>
        <div>USDX: {formatUnits(usdx.data ?? 0n, 18)}</div>
        <div>MyStock: {formatUnits(stock.data ?? 0n, 18)}</div>
      </div>

      {loading && <div style={{ marginTop: 8 }}>⏳ {loading}</div>}

      <h3 style={{ marginTop: 12 }}>Pending</h3>
      <table border={1} cellPadding={6}>
        <thead>
          <tr>
            <th>Buyer</th>
            <th>Buyer USDX</th>
            <th>Buyer funds received</th>
            <th>Seller</th>
            <th>Seller Stock</th>
            <th>Seller funds received</th>
            <th>Status</th>
            <th>Execute</th>
          </tr>
        </thead>
        <tbody>
          {pending.map((d) => (
            <tr key={d._id}>
              <td>{d.buyerAddress}</td>
              <td>{formatUnits(BigInt(d.usdxAmount), 18)}</td>
              <td>{d.buyerFundsReceived ? txLink(d.buyerTxHash) : "no"}</td>
              <td>{d.sellerAddress}</td>
              <td>{formatUnits(BigInt(d.stockAmount), 18)}</td>
              <td>{d.sellerFundsReceived ? txLink(d.sellerTxHash) : "no"}</td>
              <td>{d.status}</td>
              <td>
                <button
                  disabled={!d.buyerFundsReceived || !d.sellerFundsReceived || !!loading}
                  onClick={() => execute(d)}
                >
                  Execute
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginTop: 12 }}>Finalized</h3>
      <table border={1} cellPadding={6}>
        <thead>
          <tr>
            <th>Deal</th>
            <th>Buyer->Broker</th>
            <th>Seller->Broker</th>
            <th>Broker->Buyer</th>
            <th>Broker->Seller</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {finalized.map((d) => (
            <tr key={d._id}>
              <td>{d._id}</td>
              <td>{txLink(d.buyerTxHash)}</td>
              <td>{txLink(d.sellerTxHash)}</td>
              <td>{txLink(d.brokerToBuyerTxHash)}</td>
              <td>{txLink(d.brokerToSellerTxHash)}</td>
              <td>{d.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

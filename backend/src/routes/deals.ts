import { Router } from "express";
import { createDeal, finalizeDeal, rejectDeal, setBuyerTx, setSellerTx } from "../services/deals";
import { Deal } from "../models/Deal";
import { config } from "../config";

const router = Router();

// For demo: fixed seller address (or read from env)
const SELLER_ADDRESS = (process.env.SELLER_ADDRESS || "") as `0x${string}`;

router.post("/", async (req, res) => {
  try {
    const { buyerAddress, stockAmount } = req.body as { buyerAddress: `0x${string}`; stockAmount: string };
    const deal = await createDeal({
      buyerAddress,
      stockAmount,
      sellerAddress: SELLER_ADDRESS,
    });

    res.json({
      deal,
      brokerAddress: config.brokerAddress,
      usdxAddress: config.usdxAddress,
      mystockAddress: config.mystockAddress,
      price: config.price,
    });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/", async (req, res) => {
  const status = (req.query.status as string) || "pending";
  const deals = await Deal.find({ status }).sort({ createdAt: -1 }).limit(50);
  res.json({ deals });
});

router.get("/:id", async (req, res) => {
  const deal = await Deal.findById(req.params.id);
  if (!deal) return res.status(404).json({ error: "not found" });
  res.json({ deal });
});

router.post("/:id/buyerTx", async (req, res) => {
  try {
    const { txHash } = req.body as { txHash: `0x${string}` };
    const deal = await setBuyerTx(req.params.id, txHash);
    res.json({ deal });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/:id/sellerTx", async (req, res) => {
  try {
    const { txHash } = req.body as { txHash: `0x${string}` };
    const deal = await setSellerTx(req.params.id, txHash);
    res.json({ deal });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/:id/finalize", async (req, res) => {
  try {
    const deal = await finalizeDeal(req.params.id, req.body);
    res.json({ deal });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/:id/reject", async (req, res) => {
  try {
    const deal = await rejectDeal(req.params.id);
    res.json({ deal });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;

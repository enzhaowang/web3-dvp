import { Deal } from "../models/Deal";
import { config } from "../config";
import { waitAndVerifyErc20Transfer } from "./chain";

export async function createDeal(input: {
  buyerAddress: `0x${string}`;
  stockAmount: string; // integer string
  sellerAddress: `0x${string}`;
}) {
  const stock = BigInt(input.stockAmount);
  if (stock <= 0n) throw new Error("stockAmount must be > 0");

  const usdxAmount = stock * BigInt(config.price) * 10n ** 18n; // USDX decimals=18
  const stockAmountWei = stock * 10n ** 18n; // MyStock decimals=18

  const deal = await Deal.create({
    buyerAddress: input.buyerAddress,
    sellerAddress: input.sellerAddress,
    stockAmount: stockAmountWei.toString(),
    usdxAmount: usdxAmount.toString(),
  });

  return deal;
}

export async function setBuyerTx(dealId: string, txHash: `0x${string}`) {
  const deal = await Deal.findById(dealId);
  if (!deal) throw new Error("deal not found");

  await waitAndVerifyErc20Transfer({
    txHash,
    tokenAddress: config.usdxAddress,
    expectedFrom: deal.buyerAddress as `0x${string}`,
    expectedTo: config.brokerAddress,
    minValue: BigInt(deal.usdxAmount),
  });

  deal.buyerTxHash = txHash;
  deal.buyerFundsReceived = true;
  await deal.save();
  return deal;
}

export async function setSellerTx(dealId: string, txHash: `0x${string}`) {
  const deal = await Deal.findById(dealId);
  if (!deal) throw new Error("deal not found");

  await waitAndVerifyErc20Transfer({
    txHash,
    tokenAddress: config.mystockAddress,
    expectedFrom: deal.sellerAddress as `0x${string}`,
    expectedTo: config.brokerAddress,
    minValue: BigInt(deal.stockAmount),
  });

  deal.sellerTxHash = txHash;
  deal.sellerFundsReceived = true;
  await deal.save();
  return deal;
}

export async function finalizeDeal(dealId: string, body: {
  brokerToBuyerTxHash: `0x${string}`;
  brokerToSellerTxHash: `0x${string}`;
}) {
  const deal = await Deal.findById(dealId);
  if (!deal) throw new Error("deal not found");

  if (!deal.buyerFundsReceived || !deal.sellerFundsReceived) {
    throw new Error("funds not received from both sides");
  }

  // verify broker -> buyer stock
  await waitAndVerifyErc20Transfer({
    txHash: body.brokerToBuyerTxHash,
    tokenAddress: config.mystockAddress,
    expectedFrom: config.brokerAddress,
    expectedTo: deal.buyerAddress as `0x${string}`,
    minValue: BigInt(deal.stockAmount),
  });

  // verify broker -> seller usdx
  await waitAndVerifyErc20Transfer({
    txHash: body.brokerToSellerTxHash,
    tokenAddress: config.usdxAddress,
    expectedFrom: config.brokerAddress,
    expectedTo: deal.sellerAddress as `0x${string}`,
    minValue: BigInt(deal.usdxAmount),
  });

  deal.brokerToBuyerTxHash = body.brokerToBuyerTxHash;
  deal.brokerToSellerTxHash = body.brokerToSellerTxHash;
  deal.status = "finalized";
  await deal.save();
  return deal;
}

export async function rejectDeal(dealId: string) {
  const deal = await Deal.findById(dealId);
  if (!deal) throw new Error("deal not found");
  deal.status = "rejected";
  await deal.save();
  return deal;
}

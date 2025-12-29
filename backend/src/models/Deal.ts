import mongoose from "mongoose";

export type DealStatus = "pending" | "finalized" | "rejected";

const DealSchema = new mongoose.Schema(
  {
    buyerAddress: { type: String, required: true },
    sellerAddress: { type: String, required: true },
    stockAmount: { type: String, required: true }, // store as string to avoid JS float
    usdxAmount: { type: String, required: true },

    buyerTxHash: { type: String, default: "" },
    sellerTxHash: { type: String, default: "" },
    buyerFundsReceived: { type: Boolean, default: false },
    sellerFundsReceived: { type: Boolean, default: false },

    brokerToBuyerTxHash: { type: String, default: "" },
    brokerToSellerTxHash: { type: String, default: "" },

    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

export const Deal = mongoose.model("Deal", DealSchema);

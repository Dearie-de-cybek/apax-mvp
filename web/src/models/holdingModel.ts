import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { METALS, Metal } from "../types/holdings";

export interface IHolding extends Document {
  user: Types.ObjectId;
  asset: Metal;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

const holdingSchema: Schema<IHolding> = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    asset: {
      type: String,
      enum: METALS,
      required: true,
    },
    // grams held in the vault
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount cannot be negative"],
      default: 0,
    },
  },
  { timestamps: true }
);

holdingSchema.index({ user: 1, asset: 1 }, { unique: true });

const Holding: Model<IHolding> = mongoose.model<IHolding>("Holding", holdingSchema);
export default Holding;

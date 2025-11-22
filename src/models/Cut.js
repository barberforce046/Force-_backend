import mongoose from "mongoose";

const cutSchema = new mongoose.Schema(
  {
    barberId: { type: mongoose.Schema.Types.ObjectId, ref: "Barber", index: true, required: true },
    clientName: { type: String, required: true },
    amountPaid: { type: Number, required: true },
    description: { type: String },
    date: { type: Date, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Cut", cutSchema);
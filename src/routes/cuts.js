import express from "express";
import mongoose from "mongoose";
import Cut from "../models/Cut.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, async (req, res) => {
  const { clientName, amountPaid, description, date } = req.body;
  if (!clientName || amountPaid == null || !date) return res.status(400).json({ error: "Missing fields" });
  const cut = await Cut.create({ barberId: req.user.id, clientName, amountPaid, description, date: new Date(date) });
  res.status(201).json(cut);
});

router.get("/", auth, async (req, res) => {
  const { start, end } = req.query;
  const filter = { barberId: req.user.id };
  if (start || end) {
    filter.date = {};
    if (start) filter.date.$gte = new Date(start);
    if (end) filter.date.$lte = new Date(end);
  }
  const cuts = await Cut.find(filter).sort({ date: -1, createdAt: -1 });
  res.json(cuts);
});

router.get("/metrics", auth, async (req, res) => {
  const { granularity = "day", start, end } = req.query;
  const match = { barberId: new mongoose.Types.ObjectId(req.user.id) };
  if (start || end) {
    match.date = {};
    if (start) match.date.$gte = new Date(start);
    if (end) match.date.$lte = new Date(end);
  }
  const format = granularity === "month" ? "%Y-%m" : "%Y-%m-%d";
  const pipeline = [
    { $match: match },
    { $group: { _id: { $dateToString: { format, date: "$date" } }, totalAmount: { $sum: "$amountPaid" }, totalCount: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ];
  const items = await Cut.aggregate(pipeline);
  const totals = items.reduce(
    (acc, cur) => {
      acc.totalAmount += cur.totalAmount;
      acc.totalCount += cur.totalCount;
      return acc;
    },
    { totalAmount: 0, totalCount: 0 }
  );
  res.json({ granularity, items, ...totals });
});

export default router;
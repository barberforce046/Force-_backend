import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { port, mongoUri, dbName } from "./config.js";
import authRouter from "./routes/auth.js";
import cutsRouter from "./routes/cuts.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/", (req, res) => {
  res.json({ ok: true, service: "force-backend", endpoints: ["/api/health", "/api/auth", "/api/cuts"] });
});

app.use("/api/auth", authRouter);
app.use("/api/cuts", cutsRouter);

const start = async () => {
  if (!mongoUri) {
    throw new Error("Missing MONGODB_URI env var");
  }
  await mongoose.connect(mongoUri, { dbName });
  if (!process.env.VERCEL) {
    app.listen(port, () => {});
  }
};

start();

export default app;

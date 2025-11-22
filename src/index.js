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

let connectingPromise = null;
const ensureDb = async () => {
  if (!mongoUri) return; // allow health/root without hard failing
  if (mongoose.connection.readyState === 1) return; // connected
  if (connectingPromise) return connectingPromise;
  connectingPromise = mongoose.connect(mongoUri, { dbName }).catch((err) => {
    connectingPromise = null;
    console.error("Mongo connect error", err?.message);
  });
  return connectingPromise;
};

app.use(async (req, res, next) => {
  await ensureDb();
  next();
});

if (!process.env.VERCEL) {
  ensureDb().then(() => {
    app.listen(port, () => {});
  });
}

export default app;

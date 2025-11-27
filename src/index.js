import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { port, mongoUri } from "./config.js";
import authRouter from "./routes/auth.js";
import cutsRouter from "./routes/cuts.js";

const app = express();
const uriDbName = (() => {
  try {
    const m = String(mongoUri).match(/mongodb(?:\+srv)?:\/\/[^/]+\/([^?]*)/);
    return m && m[1] ? decodeURIComponent(m[1]) : null;
  } catch {
    return null;
  }
})();
let lastDbError = null;
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  const uriScheme = mongoUri ? String(mongoUri).split(":")[0] : null;
  res.json({ ok: true, dbConnected: mongoose.connection.readyState === 1, hasUri: !!mongoUri, uriScheme, dbName: uriDbName, lastError: lastDbError });
});

app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});

app.get("/favicon.png", (req, res) => {
  res.status(204).end();
});

app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "force-backend",
    endpoints: ["/api/health", "/api/auth", "/api/cuts"],
    dbConnected: mongoose.connection.readyState === 1,
    dbName: uriDbName
  });
});

// Ensure DB for API routes; fail fast if not connected
const requireDb = (req, res, next) => {
  ensureDb();
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: "Database unavailable" });
  }
  next();
};

app.use("/api/auth", requireDb, authRouter);
app.use("/api/cuts", requireDb, cutsRouter);

let connectingPromise = null;
const ensureDb = async () => {
  if (!mongoUri) return; // allow health/root without hard failing
  if (mongoose.connection.readyState === 1) return; // connected
  if (connectingPromise) return connectingPromise;
  connectingPromise = mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000, maxPoolSize: 5 }).catch((err) => {
    connectingPromise = null;
    lastDbError = err?.message;
    console.error("Mongo connect error", err?.message);
  });
  return connectingPromise;
};

app.use((req, res, next) => {
  ensureDb();
  next();
});

if (!process.env.VERCEL) {
  ensureDb().then(() => {
    app.listen(port, () => {});
  });
}

export default app;

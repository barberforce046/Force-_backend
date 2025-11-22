import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Barber from "../models/Barber.js";
import { jwtSecret } from "../config.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });
  const existing = await Barber.findOne({ email });
  if (existing) return res.status(409).json({ error: "Email in use" });
  const passwordHash = await bcrypt.hash(password, 10);
  const barber = await Barber.create({ name, email, passwordHash });
  res.status(201).json({ id: barber._id.toString(), name: barber.name, email: barber.email });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing fields" });
  const barber = await Barber.findOne({ email });
  if (!barber) return res.status(401).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(password, barber.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ id: barber._id.toString() }, jwtSecret, { expiresIn: "7d" });
  res.json({ token, barber: { id: barber._id.toString(), name: barber.name, email: barber.email } });
});

export default router;
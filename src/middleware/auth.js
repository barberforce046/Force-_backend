import jwt from "jsonwebtoken";
import { jwtSecret } from "../config.js";

export default function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = { id: payload.id };
    next();
  } catch (e) {
    res.status(401).json({ error: "Unauthorized" });
  }
}
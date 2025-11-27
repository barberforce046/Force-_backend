import dotenv from "dotenv";
dotenv.config();

export const port = process.env.PORT || 5000;
export const jwtSecret = process.env.JWT_SECRET || "dev_secret";
export const mongoUri = process.env.MONGODB_URI || "";
export const dbName = process.env.DB_NAME || "Force";
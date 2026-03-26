import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config({ path: process.env.DOTENV_PATH || "../.env" });

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  // Aviso temprano si falta la variable
  // No arrojamos error fatal para poder ver el health general
  console.warn("DATABASE_URL no está definida en .env");
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "gestor-voucher-ato-server" });
});

app.get("/health/db", async (_req, res) => {
  if (!DATABASE_URL) {
    return res.status(500).json({ ok: false, error: "DATABASE_URL no configurada" });
  }
  try {
    const pool = mysql.createPool({ uri: DATABASE_URL, waitForConnections: true, connectionLimit: 5 });
    const [rows] = await pool.query("SELECT 1 as ok");
    await pool.end();
    res.json({ ok: true, rows });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error de conexión";
    res.status(500).json({ ok: false, error: message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});





import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// Setup __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, "database.json");
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, "uploads");
const PUBLIC_URL_BASE = process.env.PUBLIC_URL_BASE || ""; // e.g., https://api.3svkdb.com

// --- Middlewares
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(UPLOADS_DIR));

// Ensure storage dirs/files exist
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf-8");

// --- Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const safe = Date.now() + "-" + file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, safe);
  },
});
const upload = multer({ storage });

// --- Utils
function readDB() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}
function writeDB(arr) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2));
}

// --- Routes
app.get("/", (_req, res) => {
  res.json({
    name: "3SVK DB",
    version: "1.0.0",
    status: "ok",
    routes: {
      save: "POST /save",
      data: "GET /data",
      getById: "GET /data/:id",
      upload: "POST /upload (multipart/form-data, field='file')",
      file: "GET /uploads/<filename>",
    },
  });
});

// Save JSON record
app.post("/save", (req, res) => {
  const body = req.body || {};
  const db = readDB();
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const record = { id, createdAt: new Date().toISOString(), ...body };
  db.push(record);
  writeDB(db);
  res.status(201).json({ message: "Data saved", record });
});

// Get all
app.get("/data", (_req, res) => {
  res.json(readDB());
});

// Get by id
app.get("/data/:id", (req, res) => {
  const db = readDB();
  const item = db.find((r) => r.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

// Upload file
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file provided" });
  const fileUrlPath = `/uploads/${req.file.filename}`;
  const publicUrl = PUBLIC_URL_BASE ? `${PUBLIC_URL_BASE}${fileUrlPath}` : fileUrlPath;
  res.status(201).json({
    message: "File uploaded",
    filename: req.file.filename,
    url: publicUrl,
  });
});

// ---- Optional S3 Wiring (commented template)
// To enable, install: npm i @aws-sdk/client-s3
// Then set env: S3_REGION, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY
// And replace /upload route with S3 upload logic.

// Start
app.listen(PORT, () => {
  console.log(`✅ 3SVK DB running on http://localhost:${PORT}`);
});

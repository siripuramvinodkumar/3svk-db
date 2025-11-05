# 3SVK DB v1.0
Your own simple, self-hosted backend + storage — like a tiny Firebase you control.

## Features
- JSON record storage (file-based `database.json`)
- File uploads to `/uploads` with public URLs
- Clean REST API (save/get/upload)
- Zero external dependencies (works offline)
- Ready to deploy on Render, Railway, VPS

## Quick Start (Local)
```bash
npm install
cp .env.example .env   # optionally edit
npm start
# Open: http://localhost:5000
```

### API
- **POST** `/save` — Save a JSON record
  ```bash
  curl -X POST http://localhost:5000/save         -H "Content-Type: application/json"         -d '{ "name": "Vinod", "role": "admin" }'
  ```
- **GET** `/data` — List all records
  ```bash
  curl http://localhost:5000/data
  ```
- **GET** `/data/:id` — Get a record by id
- **POST** `/upload` — Upload a file (field name: `file`)
  ```bash
  curl -F "file=@./README.md" http://localhost:5000/upload
  ```
- **GET** `/uploads/<filename>` — Access uploaded file

## Deploy to Render (Free)
1. Push this folder to a GitHub repo.
2. Create a **New → Web Service** in Render.
3. Runtime: **Node**; Build command: `npm install`; Start command: `npm start`.
4. Add environment (optional): `PUBLIC_URL_BASE` = your Render URL.
5. Deploy — done!

## Deploy to Railway (Free)
1. Push to GitHub.
2. Create new project → **Deploy from GitHub repo**.
3. Set `Start Command`: `npm start`.
4. Add env `PUBLIC_URL_BASE` = your Railway URL.

## Deploy on VPS (Full Control)
```bash
sudo apt update && sudo apt install -y nodejs npm
git clone <your_repo_url> 3svk-db
cd 3svk-db
npm install
cp .env.example .env
npm start
```
For production, use **PM2** and **Nginx** (reverse proxy + SSL).

## Make Storage "Unlimited"
- Start local with `/uploads`, then swap to a cloud bucket.
- Suggested: **Backblaze B2**, **Cloudflare R2**, **AWS S3**.
- Expose the same `/upload` API so clients don't change.

## S3 (Optional) Template
1. `npm i @aws-sdk/client-s3`
2. Set env: `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`
3. Replace `/upload` logic with an S3 `PutObjectCommand` and return the bucket URL.

## Security Notes
- This is a minimal demo. Add auth (JWT + API keys) before exposing publicly.
- Limit file types/sizes as needed.
- Back up `database.json` if important.

## License
MIT — do anything, but no warranty.

# Tuition Admin

A simple admin portal for a single teacher/admin to manage students, attendance, and fee payments.

**Stack:** React (Vite + Tailwind) frontend, Node.js + Express backend, SQLite database (one file, no separate database server). Runs as a **single process on one port** — the backend serves the built frontend directly.

## Features
- Admin login (single account, seeded from `.env`)
- Add/edit/delete students — name, class, subjects (multi-select: Maths, Science, Social Science, Kannada, Hindi, English, or "All"), parent name/contact
- Dedicated Attendance page — pick a date, mark every student Present/Absent in one screen, save once
- Fee payments logged per student per month — amount collected, your profit on that payment, payment mode (Cash/UPI/Bank). No "amount due" tracking — just a running log of what's been collected
- Dashboard — total students, total fees collected, total profit, and a recent-payments feed
- Light and dark mode (toggle in the top right, remembers your choice)
- Mobile-friendly layout

## Running it locally (development)

Two terminals, since the frontend dev server gives you instant reload while you work:

```bash
cd backend
npm install
cp .env.example .env   # edit this file: set your own JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm start
```
Backend runs on http://localhost:5050.

```bash
cd frontend
npm install
npm run dev
```
Frontend runs on http://localhost:5173 and proxies API calls to the backend. Open this URL and log in with the email/password from `.env`.

## Running it as one process (what you'll actually host)

This is the setup for real use — one server, one port, nothing separate to keep running.

```bash
cd backend
npm install
cp .env.example .env   # set your real JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD

cd ../frontend
npm install
npm run build           # builds frontend/dist

cd ../backend
npm start
```
Now open **http://localhost:5050** — that's it. The backend serves the API *and* the built frontend from the same port. This zip already includes a pre-built `frontend/dist`, so if you haven't changed any frontend code you can skip straight to `cd backend && npm install && cp .env.example .env && npm start`.

Whenever you change frontend code, re-run `npm run build` in `frontend/` and restart the backend — it always serves whatever is currently in `frontend/dist`.

## Deploying for real

- Push this folder to any Node host (Render, Railway, a small VPS, etc.)
- Set environment variables there instead of a `.env` file: `PORT`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- Build command: `cd frontend && npm install && npm run build`
- Start command: `cd backend && npm install && npm start`
- **Important:** the SQLite file (`backend/tuition.db`) needs to live on persistent disk. Don't deploy to a platform that wipes the filesystem between deploys/restarts (serverless functions, most free static hosts) unless you switch to a hosted database later.
- Put it behind HTTPS (most hosts do this for you) — logins send a password over the network.

## Changing the admin password later
Delete `backend/tuition.db`, update `.env`, and restart — it reseeds fresh. This wipes all data, so only do it before you have real records, or add a proper "change password" screen later.

## Notes on what changed recently
- Fees no longer track "amount due" vs "pending" — that was causing confusing negative numbers. Each fee record is just: month, amount collected, your profit, payment mode.
- Every API error now returns a plain message instead of a raw stack trace — nothing internal leaks to the browser.
- Deleting a student/fee/etc. that doesn't exist now returns a clean 404 instead of silently doing nothing.

## Extending this
Natural next additions: PDF payment receipts, WhatsApp/SMS reminders, a monthly summary export, multiple admin logins, a proper "change password" screen.

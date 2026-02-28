# Bitespeed — Identity Reconciliation

A web service that links customer contacts across multiple purchases, even when different email addresses and phone numbers are used.

**Live API:** `https://bitespeed-backend-su8n.onrender.com/api/identify`
**Live UI:** `https://bitespeed-backend-five.vercel.app/`

---

## How It Works

The `/api/identify` endpoint receives an email and/or phone number and returns a consolidated view of all contacts linked to the same person. Contacts are linked if they share an email or phone number with any existing contact.

- The oldest contact in a linked cluster is always the **primary**
- All others are **secondary**, pointing to the primary via `linked_id`
- If two previously separate clusters get connected, the newer primary is demoted to secondary

---

## API

### `POST /api/identify`

**Request**
```json
{
  "email": "lorraine@hillvalley.edu",
  "phoneNumber": "123456"
}
```
At least one of `email` or `phoneNumber` must be provided.

**Response**
```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": [23]
  }
}
```

### `GET /api/health`
Returns `{ "status": "ok" }` — used for uptime checks.

---

## Running Locally

**Prerequisites:** Node.js 18+, a Supabase project with the migrations applied.

```bash
# 1. Clone the repo
git clone https://github.com/your-username/bitespeed.git
cd bitespeed

# 2. Set up backend
cd backend
cp .env.example .env
# Fill in SUPABASE_URL and SUPABASE_ANON_KEY in .env
npm install
npm run dev        # runs on http://localhost:8000

# 3. Set up frontend (new terminal)
cd ../frontend
cp .env.example .env
# VITE_API_URL=http://localhost:8000 is already set
npm install
npm run dev        # runs on http://localhost:5173
```


---

## Project Structure

```
bitespeed/
  backend/
    src/
      config/          # Supabase client, env validation, rate limiter
      interfaces/      # IContactRepository, request/response DTOs
      models/          # Contact entity type
      repositories/    # Supabase implementation of IContactRepository
      services/        # PRE/IN/POST reconciliation logic
      controllers/     # Thin HTTP handlers
      middlewares/     # Error handler, JSON-only guard, Zod validation
      routes/          # Route registration + DI wiring
   
  frontend/
    src/
      components/      # IdentifyForm, ResponseViewer, HistoryPanel
      services/        # fetch wrapper for /api/identify
      types/           # Shared TypeScript types
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, TypeScript, Express |
| Validation | Zod |
| Database | Supabase (Postgres) |
| Rate Limiting | express-rate-limit |
| Frontend | React, TypeScript, Tailwind CSS, Vite |
| Hosting | Render |

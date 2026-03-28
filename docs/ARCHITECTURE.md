# Architecture & Implementation Plan

**Project:** timecard-ocr  
**Updated:** March 28, 2026

---

## Stack Overview

| Layer | Tech | Provider |
|-------|------|----------|
| Frontend | React 18 + TypeScript + Tailwind v4 | Netlify |
| Backend | Rails 7 API (Ruby) | Render (Singapore) |
| Database | PostgreSQL | Neon |
| File Storage | S3 | AWS (ap-southeast-1 — Singapore) |
| OCR | Gemini Flash via OpenRouter | OpenRouter API |
| Job Queue | Sidekiq | Render Redis |
| CI/CD | GitHub Actions | GitHub |

**No auth in v1.** Internal tool only. Add auth in v2 if needed.

---

## System Architecture

```
[Browser]
    ↓ POST /timecards (multipart image)
[Rails API — Render]
    ↓ 1. Upload original image → S3
    ↓ 2. Create Timecard record (status: pending)
    ↓ 3. Enqueue ProcessTimecardJob
    ← 200 {id, status: "pending"}

[Sidekiq Worker]
    ↓ 1. Fetch image from S3
    ↓ 2. Pre-process: resize + contrast boost
    ↓ 3. Send to OpenRouter (Gemini Flash) with structured JSON prompt
    ↓ 4. Parse + validate response JSON
    ↓ 5. Store punch entries + confidence scores
    ↓ 6. Update Timecard status → "complete" or "failed"

[Browser — polling]
    ↓ GET /timecards/:id
    ← status: "complete", punch_entries: [...]

[Reviewer]
    → edits punch entries in UI
    → clicks Export → GET /payroll_runs/:id/export.csv
```

---

## OCR Pipeline (Critical)

### Step 1: Image Pre-processing (Rails/Ruby)
```
- Resize to max 1600px (keep aspect ratio)
- Convert to JPEG quality 85
- Boost contrast slightly (helps with faded ink)
- Store preprocessed version in S3 alongside original
```

Use `mini_magick` gem for image processing.

### Step 2: OpenRouter API Call (Gemini Flash)

**Model:** `google/gemini-flash-1.5` (upgrade to 2.5 flash when stable on OpenRouter)

**Request format:** multipart with image + text prompt

**Prompt:**
```
You are extracting data from a paper time card. Return ONLY valid JSON, no markdown, no explanation.

Extract all time entries from this time card image and return this exact structure:
{
  "employee_name": "string or null",
  "period_start": "YYYY-MM-DD or null",
  "period_end": "YYYY-MM-DD or null",
  "entries": [
    {
      "date": "YYYY-MM-DD",
      "day_of_week": "Mon/Tue/Wed/Thu/Fri/Sat/Sun",
      "clock_in": "HH:MM (24hr) or null",
      "lunch_out": "HH:MM (24hr) or null",
      "lunch_in": "HH:MM (24hr) or null",
      "clock_out": "HH:MM (24hr) or null",
      "confidence": 0.0-1.0,
      "notes": "any anomaly or unclear field"
    }
  ],
  "overall_confidence": 0.0-1.0
}

Rules:
- Convert all times to 24-hour format
- If a field is blank/illegible, use null (not empty string)
- If a punch appears smudged or unclear, note it in notes
- Include ALL days shown on the card, even if empty
```

### Step 3: Response Validation (Rails)
```ruby
# Validate required fields
# Normalize time strings → Time objects
# Calculate hours_worked per entry
# Flag anomalies:
#   - Missing clock_in or clock_out
#   - Shift > 12 hours (likely error)
#   - Time overlap
#   - Entry outside pay period
# Set confidence buckets: high (≥0.9), medium (0.7-0.9), low (<0.7)
```

### Step 4: Retry Logic
- Retry up to 3 times on API failure (exponential backoff: 5s, 25s, 125s)
- If all retries fail: mark timecard `failed`, notify reviewer
- Idempotency: hash image file (SHA256) before processing; skip if already processed

---

## OT Calculation Rules

```
Standard (Guam labor law):
- Regular time: first 40 hours/week
- OT: hours > 40 at 1.5x

Daily OT (if enabled in settings):
- > 8 hours/day at 1.5x
- > 12 hours/day at 2.0x

Rounding options:
- Exact (default for v1)
- Nearest 15 minutes
- Nearest 6 minutes (common on Guam)

Lunch/break exclusion:
- Any recorded break is excluded from worked hours
- If no break logged, flag it but don't assume
```

---

## API Contracts

### POST /timecards
Upload a time card image.

**Request:** `multipart/form-data`
- `image` — file (JPG/PNG/HEIC)

**Response 202:**
```json
{
  "id": "uuid",
  "status": "pending",
  "created_at": "ISO8601"
}
```

---

### GET /timecards/:id
Get timecard with punch entries.

**Response 200:**
```json
{
  "id": "uuid",
  "employee_name": "Maria Santos",
  "period_start": "2026-03-16",
  "period_end": "2026-03-29",
  "status": "complete",
  "image_url": "https://s3.../original.jpg",
  "overall_confidence": 0.87,
  "punch_entries": [
    {
      "id": "uuid",
      "date": "2026-03-16",
      "day_of_week": "Mon",
      "clock_in": "08:00",
      "lunch_out": "12:00",
      "lunch_in": "13:00",
      "clock_out": "17:00",
      "hours_worked": 8.0,
      "confidence": 0.95,
      "manually_edited": false,
      "notes": null
    }
  ]
}
```

---

### GET /timecards
List all timecards with summary info.

**Query params:** `status`, `period_start`, `period_end`

---

### PATCH /punch_entries/:id
Update a single punch entry (reviewer edit).

**Request:**
```json
{
  "clock_in": "08:15",
  "clock_out": "17:00",
  "lunch_out": "12:00",
  "lunch_in": "12:30"
}
```

---

### POST /payroll_runs
Generate a payroll summary for a date range.

**Request:**
```json
{
  "period_start": "2026-03-16",
  "period_end": "2026-03-29"
}
```

**Response:** payroll run with summaries per employee

---

### GET /payroll_runs/:id/export.csv
Download payroll summary as CSV.

**CSV columns:**
```
Employee Name, Period Start, Period End, Regular Hours, OT Hours, Total Hours, Flags
```

---

## Database Schema

```sql
-- timecards
id UUID PK
employee_name VARCHAR
period_start DATE
period_end DATE
image_url TEXT (S3 original)
preprocessed_image_url TEXT (S3 processed)
image_hash VARCHAR(64) (SHA256, unique — prevents duplicate processing)
ocr_status ENUM ('pending', 'processing', 'complete', 'failed')
overall_confidence FLOAT
raw_ocr_response JSONB (full LLM response for debugging)
created_at, updated_at

-- punch_entries
id UUID PK
timecard_id UUID FK
date DATE
day_of_week VARCHAR(3)
clock_in TIME
lunch_out TIME
lunch_in TIME
clock_out TIME
hours_worked FLOAT (calculated, stored for performance)
confidence FLOAT
manually_edited BOOLEAN DEFAULT false
notes TEXT
created_at, updated_at

-- payroll_runs
id UUID PK
period_start DATE
period_end DATE
ot_threshold FLOAT DEFAULT 40.0
ot_multiplier FLOAT DEFAULT 1.5
rounding_rule ENUM ('exact', '15min', '6min')
export_url TEXT (S3 CSV)
generated_at TIMESTAMP
created_at, updated_at

-- payroll_summaries
id UUID PK
payroll_run_id UUID FK
employee_name VARCHAR
regular_hours FLOAT
overtime_hours FLOAT
total_hours FLOAT
flags JSONB (array of flag strings)
created_at, updated_at
```

---

## Environment Variables

### Rails API
```
DATABASE_URL=           # Neon Postgres connection string
REDIS_URL=              # Render Redis
AWS_ACCESS_KEY_ID=      # S3
AWS_SECRET_ACCESS_KEY=  # S3
AWS_BUCKET=             # S3 bucket name
AWS_REGION=             # ap-southeast-1 (Singapore)
OPENROUTER_API_KEY=     # OpenRouter
OPENROUTER_MODEL=       # google/gemini-flash-1.5
RAILS_ENV=production
SECRET_KEY_BASE=        # rails secret
```

### React Frontend
```
VITE_API_BASE_URL=      # https://your-api.onrender.com
```

---

## Deployment Plan

### Frontend (Netlify)
- Build command: `cd web && npm run build`
- Publish dir: `web/dist`
- Add `web/public/_redirects`:  `/* /index.html 200` (SPA routing)
- Auto-deploy on push to `main`

### Backend (Render — Singapore)
- Service type: Web Service
- Build command: `bundle install && rails db:migrate`
- Start command: `bundle exec rails server -p $PORT`
- Region: Singapore (`ap-southeast-1`)
- Also add a Worker service for Sidekiq:
  - Start command: `bundle exec sidekiq`

### Database (Neon)
- Create project in AWS ap-southeast-2 (Sydney — closest to Guam available)
- Copy connection string → `DATABASE_URL`
- Run `rails db:create db:migrate` on first deploy

### S3 Bucket Setup
- Region: ap-southeast-1 (Singapore)
- Bucket name: `shimizu-timecard-ocr`
- CORS config: allow `GET, PUT, POST` from `*.netlify.app` and production domain
- Block public access: ON (serve via signed URLs only)

---

## Feature Flags (v2 ideas — do NOT build now)
- Auth (Clerk)
- Multi-company support
- Direct payroll system integration
- Mobile camera upload flow
- Employee self-service portal

---

## Rollout Plan

| Phase | What | When |
|-------|------|------|
| v1 | Upload + OCR + review + CSV export (internal) | Target: 1 week |
| v2 | PDF export, confidence flags, pay period history | +1 week |
| v3 | Auth, audit log, multi-user | TBD |

---

## Cost Estimates (Monthly)

| Service | Est. Cost |
|---------|-----------|
| Render (Web + Worker) | ~$14/mo (Starter plan) |
| Neon (Free tier) | $0 |
| S3 (low volume) | <$1 |
| OpenRouter Gemini Flash | ~$0.10-0.50/mo (13 cards/period) |
| Netlify (Free) | $0 |
| **Total** | ~$15-16/mo |

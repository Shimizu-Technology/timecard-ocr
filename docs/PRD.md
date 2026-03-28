# Time Card OCR — Product Requirements Document

**Project:** timecard-ocr  
**Owner:** Shimizu Technology  
**Created:** March 28, 2026  
**Status:** v1 Active Development

---

## Problem

Cornerstone (and similar small businesses on Guam) use paper time cards (Pyramid brand). Every pay period, someone manually adds up punch times to calculate hours worked and overtime. With ~13 employees, this is error-prone and time-consuming.

## Goal

Build a web application that:
1. Accepts photos of paper time cards
2. Uses OCR to extract punch times
3. Lets a reviewer verify/edit the extracted data
4. Calculates regular hours, overtime, and flags anomalies
5. Exports a payroll summary CSV/PDF

---

## Target Users

- Payroll administrator (primary) — uploads cards, reviews, exports
- Manager — views summaries, approves

---

## Core Features (v1)

### 1. Upload Screen
- Drag-and-drop or file picker for multiple images
- Accepts JPG, PNG, HEIC (phone photos)
- Shows upload progress and OCR status per card
- Batch upload (all 13 at once)

### 2. Card Review Screen
- Split view: original photo (left) + extracted data table (right)
- Editable fields: Employee Name, Period Start/End, and per-day In/Out/Break times
- Confidence indicators: green (high), yellow (medium), red (low/missing)
- "Next card" navigation
- Auto-save on edit

### 3. Payroll Summary Screen
- Table: Employee | Regular Hrs | OT Hrs | Total Hrs | Flags
- Flags: missing punches, >12hr shifts, rounding issues
- Pay period selector
- Export to CSV (primary) and PDF summary

### 4. Settings
- OT rules: weekly threshold (default 40 hrs), multiplier (default 1.5x)
- Rounding rules: nearest 15 min (default), nearest 6 min, exact
- Pay period type: weekly / bi-weekly
- Time format: 12hr / 24hr

---

## Technical Architecture

### Frontend
- **React 18 + TypeScript**
- **Tailwind CSS v4**
- **TanStack Query** for server state
- **React Router** for navigation
- **Lucide React** for icons (NO emojis in UI)

### Backend
- **Rails 7 API** (Ruby)
- **PostgreSQL**
- **ActiveStorage** + Cloudinary/S3 for image storage
- **Sidekiq** for async OCR processing
- **Redis** for job queue

### OCR Strategy
- **Phase 1:** Google Cloud Vision API (handwriting model — best for time cards)
- **Phase 2:** Template-based zone extraction (since Pyramid cards have consistent layout)
- Fallback: Tesseract for offline/cost reduction

### Database Schema

```
timecards
  - id
  - employee_name
  - period_start, period_end
  - image_url
  - ocr_status (pending/processing/complete/failed)
  - created_at

punch_entries
  - id
  - timecard_id
  - date
  - time_in, time_out, break_start, break_end
  - hours_worked (calculated)
  - confidence_score
  - manually_edited (boolean)

payroll_runs
  - id
  - period_start, period_end
  - generated_at
  - export_url

payroll_summaries
  - id
  - payroll_run_id
  - employee_name
  - regular_hours, overtime_hours, total_hours
  - flags (jsonb array)
```

---

## OT Calculation Rules (Guam Standard)

- Regular: first 40 hours/week
- OT: hours > 40 at 1.5x
- Daily OT (if enabled): hours > 8/day at 1.5x, > 12/day at 2x
- Break time (30+ min) NOT counted as work time

---

## Phase Plan

| Phase | Scope | Timeline |
|-------|-------|----------|
| v1 | Upload + OCR + review table + CSV export | 3-5 days |
| v2 | Confidence scoring, anomaly flags, PDF, pay period mgmt | 1 week |
| v3 | PayPal/direct payroll integration, audit logs, multi-user | TBD |

---

## Design Principles
- No emojis in UI — SVGs/icons only
- Mobile-friendly upload (photos taken on phone)
- Human-in-the-loop: OCR is a draft, human confirms before export
- Fast review flow: keyboard shortcuts for next/prev card

---

## Repo Structure

```
timecard-ocr/
├── api/          # Rails API backend
├── web/          # React frontend
├── docs/         # PRD, wireframes, decisions
└── README.md
```

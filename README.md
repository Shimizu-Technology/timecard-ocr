# timecard-ocr

> Upload paper time card photos → OCR extracts punches → Calculate hours + OT → Export payroll CSV

Built by Shimizu Technology for Cornerstone Payroll.

## Stack

- **Frontend:** React 18 + TypeScript + Tailwind CSS v4
- **Backend:** Rails 7 API + PostgreSQL
- **OCR:** Google Cloud Vision API
- **Queue:** Sidekiq + Redis
- **Storage:** Cloudinary (images)

## Getting Started

### Backend (Rails API)
```bash
cd api
bundle install
rails db:setup
rails server
```

### Frontend (React)
```bash
cd web
npm install
npm run dev
```

## Docs

- [PRD](docs/PRD.md) — full product requirements

## Status

🚧 Active development — v1

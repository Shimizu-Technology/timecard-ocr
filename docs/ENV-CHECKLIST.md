# Environment Variables Checklist

Before first deploy, you need to collect these credentials:

## AWS S3
- [ ] Create S3 bucket: `shimizu-timecard-ocr` in `ap-southeast-1`
- [ ] Create IAM user with S3 access, get:
  - [ ] `AWS_ACCESS_KEY_ID`
  - [ ] `AWS_SECRET_ACCESS_KEY`
- [ ] Set `AWS_BUCKET=shimizu-timecard-ocr`
- [ ] Set `AWS_REGION=ap-southeast-1`
- [ ] Configure bucket CORS

## OpenRouter
- [ ] Get API key from openrouter.ai
  - [ ] `OPENROUTER_API_KEY`
- [ ] Set `OPENROUTER_MODEL=google/gemini-flash-1.5`

## Neon (Database)
- [ ] Create project at neon.tech
  - [ ] `DATABASE_URL` (full connection string with pooler)

## Render (Backend)
- [ ] Create Web Service + Worker Service
  - [ ] `REDIS_URL` (from Render Redis add-on)
  - [ ] `SECRET_KEY_BASE` (run `rails secret` to generate)
  - [ ] All env vars above

## Netlify (Frontend)
- [ ] Set `VITE_API_BASE_URL` to Render API URL

---

## Secrets Storage
Store all secrets in 1Password vault "timecard-ocr" before deploying.

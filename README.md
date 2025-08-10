# Kerala South Cliff - Deploy Ready

This build includes:
- Crop -> Canvas -> Blob -> Upload flow to `/api/upload-cropped` which tries UploadThing then Cloudinary fallback, and persists URLs to DB.
- Drag-and-drop gallery reorder with automatic save.
- TipTap editor with image embedding.
- Redis-backed rate-limiter support (falls back to in-memory if REDIS_URL not present).
- 2FA via Twilio/SendGrid (optional).
- Lighthouse CI script to run local audits.

## Environment variables (set in Vercel)
- MONGODB_URI
- JWT_ACCESS_SECRET
- JWT_REFRESH_SECRET
- UPLOADTHING_TOKEN
- CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET (optional for fallback)
- REDIS_URL (optional)
- TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM OR SENDGRID_API_KEY, SENDGRID_FROM (optional)
- NEXT_PUBLIC_SITE_API (optional)

## Run locally
1. npm install
2. create .env.local with the variables above
3. npm run dev

## Lighthouse CI (local)
This repo includes a `lighthouse` npm script that uses Lighthouse CI autorun and uploads results to temporary public storage.
Run `npm run lighthouse` after starting your local server to obtain audit scores and a report link.

## Security
Do not commit `.env.local` to Git. Use Vercel environment variables for production and rotate keys after testing.

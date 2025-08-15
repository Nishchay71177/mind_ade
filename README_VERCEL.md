# Deploying to Vercel (mind-ade)

## One-time setup
1. Push this repo to GitHub.
2. Create a new project at https://vercel.com/new and import the repo.
3. Set **root directory** to the repository root (where `package.json` is).

## Build settings
- **Build Command**: `npm run build`
- **Output Directory**: `dist/public`
- **Install Command**: `npm install`

## Environment variables
- Add `GROQ_API_KEY` in **Vercel → Project → Settings → Environment Variables**.
- After adding, click **Redeploy**.

## API routes
- The Express server has been converted to **Serverless Functions** under `/api`:
  - `POST /api/chat/session` — create session
  - `POST /api/chat/message` — send user message, get AI reply
  - `DELETE /api/chat/session/:id` — end session (optional)

## SPA routing
`vercel.json` contains a fallback so that all client routes serve `index.html`.
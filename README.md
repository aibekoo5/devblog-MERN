# DevBlog — Full Stack Developer Platform

A full-stack MERN + Next.js platform where developers write and share articles.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), Plain CSS, React Context |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Real-time | WebSocket (`ws` library) |
| File uploads | UploadThing |
| Testing | Jest + Supertest + React Testing Library |
| Deploy | Vercel (frontend) + Render (backend) |

## Project Structure

```
devblog/
├── backend/     ← Express API + WebSocket
└── frontend/    ← Next.js App Router
```

## Quick Start

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Set MONGODB_URI and JWT_SECRET
npm run dev          # runs on :5000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL, UPLOADTHING_SECRET, UPLOADTHING_APP_ID
npm run dev          # runs on :3000
```

## Mandatory Requirements Coverage

| Requirement | Implementation |
|-------------|---------------|
| 4 Mongoose models (5+ fields each) | User, Post, Comment, Tag |
| 1:N relationship | Post → User (author) |
| M:N relationship | Post ↔ Tag, User ↔ Tag (followers) |
| JWT auth + bcrypt | `/api/auth/*`, `middleware/auth.js` |
| WebSocket (`ws`) | `utils/websocket.js` — online users + notifications |
| App Router (Server + Client) | All pages use both component types |
| Plain CSS | `styles/globals.css` — no Tailwind |
| Responsive design | Mobile/tablet/desktop CSS |
| UploadThing (2 types) | `avatarUploader` + `postCoverUploader` |
| CRUD × 2 resources | Posts (full CRUD) + Comments (full CRUD) |
| Authorization | Users can only edit/delete own resources |
| Search / Filter | `?search=`, `?tag=`, `?sort=`, pagination |
| 10 Jest tests | `backend/tests/main.test.js` + `frontend/__tests__/components.test.jsx` |

## Deployment

### Backend → Render
1. Connect GitHub repo
2. Set env vars: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`
3. Build: `npm install`, Start: `node server.js`

### Frontend → Vercel
1. Connect GitHub repo, set root to `frontend/`
2. Set env vars: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`, `UPLOADTHING_SECRET`, `UPLOADTHING_APP_ID`

## Live URLs (fill in after deploy)

- Frontend: `https://devblog.vercel.app`
- Backend: `https://devblog-api.onrender.com`

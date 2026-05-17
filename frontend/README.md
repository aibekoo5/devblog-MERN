# DevBlog — Frontend

Next.js 14 · App Router · Plain CSS · UploadThing

## Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Fill in your UPLOADTHING_SECRET and UPLOADTHING_APP_ID
npm run dev
```

## Structure

```
app/
  layout.jsx               ← Root layout (Server Component)
  page.jsx                 ← Home page
  (auth)/
    login/page.jsx         ← Login (no sidebar)
    register/page.jsx      ← Register (no sidebar)
  (main)/
    posts/[slug]/page.jsx  ← Single post view
    write/page.jsx         ← Write / edit post
    profile/[username]/    ← User profile
    tags/[slug]/           ← Tag page
  api/uploadthing/route.js ← UploadThing API handler

components/
  layout/
    Navbar.jsx             ← Top bar, WebSocket online count, notifications
    Sidebar.jsx            ← Nav + popular tags
    MainLayout.jsx         ← Sidebar + main wrapper
  posts/
    PostCard.jsx           ← Post list card
    PostsFeed.jsx          ← Feed with search, sort, pagination (Client)
    PostDetail.jsx         ← Full post view with like (Client)
    WriteEditor.jsx        ← Create/edit form with cover upload (Client)
  comments/
    CommentsSection.jsx    ← Threaded comments (Client)
  auth/
    LoginForm.jsx          ← Login form (Client)
    RegisterForm.jsx       ← Register form (Client)
  profile/
    ProfileView.jsx        ← Profile with avatar upload (Client)
  tags/
    TagView.jsx            ← Tag detail with follow (Client)
  ui/
    Avatar.jsx             ← Reusable avatar component

context/
  AuthContext.jsx          ← Global auth state (login, logout, updateUser)

hooks/
  useWebSocket.js          ← WS connect, online count, notifications

lib/
  api.js                   ← All API calls (fetch wrapper)
  uploadthing.js           ← UploadThing file router (avatar + cover)
```

## Key Features

- Server + Client Components throughout
- Plain CSS with dark mode support (prefers-color-scheme)
- Fully responsive (mobile, tablet, desktop)
- UploadThing for: avatar (avatarUploader) + post cover (postCoverUploader)
- WebSocket: online user count in navbar + live notifications bell
- Search (debounced), sort tabs, pagination in feed
- Protected routes (redirect to /login if unauthenticated)

## Run Tests

```bash
npm test
```

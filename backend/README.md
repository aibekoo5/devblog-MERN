# DevBlog — Backend API

Node.js + Express + MongoDB + WebSocket

## Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

## API Endpoints

### Auth
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, get JWT |
| GET | `/api/auth/me` | ✓ | Get current user |
| PUT | `/api/auth/profile` | ✓ | Update profile/avatar |

### Posts
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/posts` | — | List posts (search, filter, paginate) |
| GET | `/api/posts/:slug` | — | Get single post |
| POST | `/api/posts` | ✓ | Create post |
| PUT | `/api/posts/:id` | ✓ | Update own post |
| DELETE | `/api/posts/:id` | ✓ | Delete own post |
| POST | `/api/posts/:id/like` | ✓ | Like/unlike post |

### Comments
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/posts/:postId/comments` | — | Get comments for post |
| POST | `/api/posts/:postId/comments` | ✓ | Add comment |
| PUT | `/api/comments/:id` | ✓ | Edit own comment |
| DELETE | `/api/comments/:id` | ✓ | Delete own comment |

### Tags
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/tags` | — | List all tags |
| GET | `/api/tags/:slug` | — | Get tag details |
| POST | `/api/tags` | Admin | Create tag |
| POST | `/api/tags/:id/follow` | ✓ | Follow/unfollow tag |

## WebSocket

Connect: `ws://localhost:5000?token=YOUR_JWT`

Events received:
- `online_users` — `{ type, userIds[], count }` — broadcast on connect/disconnect
- `notification` — `{ type, message, postId?, ... }` — targeted notification

Events sent:
- `ping` — server responds with `pong`

## Run Tests

```bash
npm test
```

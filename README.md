# CloudDrive (Upload Service)

>A small full-stack file upload manager built with a TypeScript Node/Express backend (Prisma for DB + local disk for file storage) and a Vite + React frontend. Includes authentication, file upload endpoints, and a simple UI for managing files.

---

## Key Features
- User authentication (JWT)
- File upload with progress reporting
- Files stored on disk (backend/uploads) and referenced in the database (Prisma)
- Simple React + MUI frontend with grid/list views, search, and upload drawer

---

## Repository layout

- `backend/` — Express + TypeScript API, Prisma models and migrations, upload routes
- `Frontend/` — Vite + React (TypeScript) frontend application

Detailed notable files:
- `backend/src/index.ts` — server entry (listens on port 3000)
- `backend/prisma/schema.prisma` — DB schema and models
- `backend/src/routes/uploadRouter.ts` — upload endpoints (POST /v1/upload, DELETE /v1/upload/:id, etc.)
- `Frontend/src/pages/Dashboard.tsx` — main UX for file listing + upload
- `Frontend/src/services/api.ts` — Axios instance, reads `VITE_API_URL`.

---

## Prerequisites
- Node.js (recommended 18+)
- npm (or yarn)

---

## Backend — Setup & Run

1. Open a terminal and install dependencies:

```
cd backend
npm install
```

2. Create a `.env` at `backend/.env` and set the environment variables used by the app. Typical variables:

```
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"
JWT_SECRET=your_jwt_secret_here
PORT=3000
# Optional (mail):
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=you@example.com
SMTP_PASS=yourpassword
```

3. Initialize Prisma (generate client, run migrations)

```
npx prisma generate
npx prisma migrate dev --name init
```

4. (Optional) Run seed script if you have `prisma/seed.ts`:

```
npm run seed
```

5. Start the server

- Production build and start:

```
npm run start
```

- Development (fast run using `tsx` which is included in devDependencies):

```
npx tsx src/index.ts
```

By default the server listens on port `3000` (see `backend/src/index.ts`). The server ensures a `uploads/` directory exists at backend project root for storing uploaded files.

---

## Frontend — Setup & Run

1. Install dependencies:

```
cd Frontend
npm install
```

2. Create a `.env` or `.env.local` in the `Frontend/` folder and set the API URL used by the frontend Vite app:

```
VITE_API_URL=http://localhost:3000
```

3. Start dev server:

```
npm run dev
```

4. Build for production:

```
npm run build
npm run preview
```

---

## API Endpoints (high level)

The backend mounts routes under `/v1`:

- `POST /v1/upload` — upload a file (multipart/form-data) — the frontend uses this to send files with progress
- `GET /v1/user/files-db` — list files for the authenticated user
- `DELETE /v1/upload/:id` — delete file by id
- `POST /v1/auth/*` — authentication endpoints (login/register/refresh)

Examples (cURL):

Upload a file:

```
curl -F "file=@/path/to/file.pdf" -H "Authorization: Bearer <TOKEN>" http://localhost:3000/v1/upload
```

Delete a file:

```
curl -X DELETE -H "Authorization: Bearer <TOKEN>" http://localhost:3000/v1/upload/<file-id>
```

---

## File Upload Flow (Frontend → Backend)

1. User selects file(s) in the UI or drops them into the dashboard.
2. Frontend creates `FormData` with the file and posts to `/v1/upload` using Axios `onUploadProgress` to report progress.
3. Backend receives file via `multer`, stores on disk under `backend/uploads/<uuid>/` and creates a DB record (Prisma) linking the stored file with the user.
4. Frontend saves the returned file metadata to its Redux store and shows success notification.

See `Frontend/src/pages/Dashboard.tsx` for the implementation of the upload and progress UI.

---

## Database (Prisma)

- Schema is in `backend/prisma/schema.prisma` and migrations are under `backend/prisma/migrations/`.
- Typical workflow:

```
npx prisma migrate dev --name meaningful_name
npx prisma generate
npm run seed   # if seed script exists
```

If you use PostgreSQL, set `DATABASE_URL` accordingly; for SQLite use a file path in `DATABASE_URL`.

---

## Environment & Configuration Summary

- Backend: `backend/.env` — `DATABASE_URL`, `JWT_SECRET`, `PORT`, mail settings
- Frontend: `Frontend/.env` — `VITE_API_URL` (e.g. `http://localhost:3000`)

---

## Troubleshooting

- CORS errors: confirm backend `cors()` is enabled and `VITE_API_URL` matches backend origin.
- DB issues: run `npx prisma migrate status` and ensure `DATABASE_URL` is reachable.
- Uploads not found: server stores files under `backend/uploads`; confirm the folder exists and permissions allow writing.
- Auth errors: ensure you include `Authorization: Bearer <accessToken>` header; frontend stores tokens in `localStorage`.

---



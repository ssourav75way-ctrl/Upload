# CloudDrive - Full-Stack File Management with OS Push Notifications

**CloudDrive** is a high-performance full-stack application designed for seamless file storage and real-time management. It features a robust TypeScript Node/Express backend powered by Prisma and a modern, reactive Vite + React frontend.

The standout feature of this project is its **OS-Level Push Notification System**, which delivers background alerts and summarize batch actions (like multiple file uploads) into single, clean system notifications even when the browser tab is closed.

---

## 🚀 Key Features

### 📂 File Management

- **Multipart Uploads**: Individual and batch file uploads with real-time progress tracking.
- **Ownership Tracking**: Files are stored on disk and strictly mapped to users via Prisma.
- **Summary Notifications**: Intelligently aggregates multiple file uploads into a single OS notification.

### 🔔 Real-time Notifications (OS-Level)

- **Native OS Alerts**: Uses Web Push API and Service Workers to trigger native Mac/Windows notifications.
- **Background Support**: Receive alerts even if the tab is closed or the browser is minimized.
- **Test Modes**: Includes built-in "Instant" and "Delayed (10s)" test buttons to verify background notification delivery.

### 🔐 Security & Auth

- **JWT Authorization**: Secure Access and Refresh token flow.
- **Role-based Access**: Support for USER and ADMIN dashboards.
- **Secure Storage**: Files are served via authenticated routes to prevent unauthorized access.

---

## 🛠️ Project Structure

- `backend/` - Node.js & Express API, Prisma ORM, Multer storage, and Web-Push logic.
- `Frontend/` - Vite, React, Redux Toolkit, and Material UI (MUI).

---

## ⚙️ Installation Guide

### 1. Prerequisites

- **Node.js**: v18.0.0 or higher
- **PostgreSQL**: A running instance (or Neon DB as used in development)

### 2. Backend Setup

```bash
cd backend
npm install
```

1. Create a `backend/.env` file with the following variables:

```env
# Database
DATABASE_URL="your_postgresql_url"
DIRECT_DATABASE_URL="your_direct_postgresql_url"

# Auth Secrets
JWT_SECRET="your_secret"
ACCESS_TOKEN="access_secret"
REFRESH_TOKEN="refresh_secret"
RESET_TOKEN="reset_secret"

# Notifications (VAPID)
# Generate via: npx web-push generate-vapid-keys
VAPID_PUBLIC_KEY="your_vapid_public_key"
VAPID_PRIVATE_KEY="your_vapid_private_key"

# Email (Nodemailer)
EMAIL_ADDRESS="your_email@gmail.com"
EMAIL_PASSWORD="your_app_password"
```

2. Initialize the Database:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

3. Start the Server:

```bash
npm run start
```

### 3. Frontend Setup

```bash
cd Frontend
npm install
```

1. Create a `Frontend/.env` file:

```env
VITE_API_URL="http://localhost:3000"
VITE_VAPID_PUBLIC_KEY="your_vapid_public_key"
```

2. Start the Development Server:

```bash
npm run dev
```

---

## 🛣️ API Routes Summary

### Authentication (`/v1/auth`)

- `POST /login`: User login and token generation.
- `POST /signup`: New account creation.
- `POST /refresh`: Refresh session tokens.

### User & Notifications (`/v1/user`)

- `GET /profile`: Fetch authenticated user details.
- `POST /save-subscription`: Register browser push subscription.
- `POST /test-notification`: Trigger an instant OS notification.
- `POST /test-notification-delayed`: Trigger an OS notification with a 10s delay (test background alerts).
- `POST /notify-upload-batch`: Send an aggregated notification for multiple file uploads.

### File Uploads (`/v1/upload`)

- `POST /`: Upload file (Multipart).
- `GET /file/:id`: Securely serve/download a file.
- `DELETE /:id`: Delete a file and its disk storage.

---

## 💡 How to Handle the Project

### Testing Background Notifications

1. Ensure you have granted notification permissions in your browser.
2. Click **"Test Background Alert (10s)"** in the Dashboard sidebar.
3. **Immediately close the browser tab**.
4. After 10 seconds, your OS will display a native alert, demonstrating the Background Push capability.

### Handling Batch Uploads

The UI is optimized for bulk actions. Selecting multiple files in the "New File" dialog will trigger simultaneous uploads. Instead of seeing 10 different notifications, the system will wait for completion and show a single summary: _"Successfully uploaded 10 files"_.

---

## Contributing

1. Fork the repo and create a feature branch.
2. Add tests where appropriate and keep changes small and focused.
3. Open a PR describing the change and the reason.

---

## License

MIT

---

If you'd like, I can also:

- Add a sample `.env.example` for both backend and frontend.
- Add a `Makefile` or npm scripts wrapper for common tasks.
- Create a small Postman collection or OpenAPI spec for the API.

File created: [README.md](README.md)

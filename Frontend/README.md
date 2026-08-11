# Blog Platform Frontend

Welcome to the **Blog Platform Frontend**! This is a modern, high-performance web application built with **React 19**, **TypeScript**, and **Vite**. It provides a sleek and intuitive interface for users and administrators to interact with a blog ecosystem.

## Key Features

### Secure Authentication

- **Password Recovery**: Integrated "Forgot Password" workflow to ensure users never lose access.
- **JWT-Based Security**: Secure session management using JSON Web Tokens.

### Smart Routing

- **Protected Routes**: Sensitive areas like dashboards are guarded by custom Auth Loaders.
- **Role-Based Access**: Dedicated interfaces for regular users (`/dashboard`) and administrators (`/admin-dashboard`).
- **Seamless Navigation**: Managed by `react-router` for a smooth Single Page Application (SPA) experience.

### State & Data Management


- **React Hook Form**: Performant form handling with robust validation.

### Modern UI/UX

- **Material UI (MUI)**: A premium design system ensuring consistency and responsiveness across all devices.
- **Dynamic Loading**: Smooth transitions and loading states for a high-end feel.

---

## Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Material UI (MUI)](https://mui.com/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Routing**: [React Router](https://reactrouter.com/)
- **Forms**: [React Hook Form](https://react-hook-form.com/)
- **API Client**: [Axios](https://axios-http.com/)

---

## Project Structure

```text
src/
├── components/     # Reusable UI components
├── layouts/        # Page layouts (Admin, Auth, etc.)
├── pages/          # Main page views (Login, Signup, Dashboards)
├── routes/         # Routing logic (Public vs. Protected)
├── services/       # API, JWT, and Auth helpers
├── store/          # Redux slices and hooks
└── assets/         # Static assets like images and icons
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- npm or yarn

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd blogFrontend
   ```

2. **Install dependencies:**

   

4. **Run the development server:**

   ```bash
   npm run dev
   ```

---

# Finora

Premium finance and loan management dashboard frontend built with React, Tailwind CSS, Framer Motion, and React Router.

## Features

- Dark finance dashboard UI
- Responsive sidebar and mobile navigation
- Dashboard analytics cards and charts
- Customer management
- Loan management
- EMI tracking
- Reports page
- Reusable components and dummy data
- Framer Motion page and component animations

## Run Locally

```bash
npm install
npm run dev
```

Then open `http://localhost:5173`.

## Backend API

Phase 2 backend lives in `backend/`.

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Set `VITE_API_BASE_URL=http://localhost:5000/api/v1` in the frontend `.env` file to connect the React app to Express.

## Phase 3 Full-Stack Flow

- Frontend API calls use Axios from `src/services/apiClient.js`.
- Login and signup write the JWT to `localStorage` as `finora_token`.
- Protected dashboard routes redirect to `/login` until the backend confirms `/auth/me`.
- Dashboard, customers, loans, EMIs, and payments are API-backed.
- Forms show toast notifications, loading states, and API error messages.

Run both services in separate terminals:

```bash
cd backend
npm run dev
```

```bash
npm run dev
```

The backend requires real `MONGODB_URI` and `JWT_SECRET` values in `backend/.env`.

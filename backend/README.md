# Finora Backend API

Node.js, Express.js, MongoDB Atlas, and JWT backend for the Finora finance dashboard.

## Setup

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Update `.env` with your MongoDB Atlas connection string and JWT secret.

## Base URL

```txt
http://localhost:5000/api/v1
```

## Main Routes

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `GET|POST /customers`
- `GET|PATCH|DELETE /customers/:id`
- `GET|POST /loans`
- `GET|PATCH|DELETE /loans/:id`
- `POST /loans/:id/calculate/simple-interest`
- `POST /loans/:id/calculate/compound-interest`
- `GET|POST /emis`
- `GET|PATCH|DELETE /emis/:id`
- `PATCH /emis/:id/mark-paid`
- `GET|POST /payments`
- `GET /payments/:id`
- `POST /payments/:id/refund`

All routes except register/login require:

```txt
Authorization: Bearer <jwt>
```

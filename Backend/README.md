# LMS Backend - Authentication Journey

This backend implements a full authentication system for Node.js + Express + MongoDB and is ready to be reused as a starter in other projects.

## Tech Stack
- Node.js
- Express
- MongoDB + Mongoose
- JWT (access + refresh)
- Joi validation
- Nodemailer (SMTP/Brevo)
- Google ID token verification (`google-auth-library`)

## Current Features
- Register with email/password
- Email verification by token link
- Login blocked until email is verified
- Login with Google (`idToken`)
- Access token + refresh token flow
- Refresh token stored in httpOnly cookie
- Logout clears refresh token from cookie + database
- Protected route (`/api/auth/me`)
- Update avatar route (`/api/auth/avatar`)
- Centralized error handling and validation middleware

## Project Structure
- `app.js`: Express app bootstrap and middleware setup
- `config/db.js`: MongoDB connection
- `models/user.model.js`: User schema and password hashing
- `controllers/auth.controller.js`: Authentication business logic
- `routes/auth.route.js`: Authentication endpoints
- `middlewares/auth.middleware.js`: Protect and authorize middlewares
- `middlewares/validate.middleware.js`: Joi request body validation
- `middlewares/errorHandler.middleware.js`: Global error response formatter
- `validators/auth.validator.js`: Joi schemas for auth routes
- `utils/sendEmail.js`: SMTP email sender
- `utils/verifyGoogleIdToken.js`: Google token verification helper
- `postman/`: Postman collection + environment

## Environment Variables
Create `.env` based on `.env.example`.

Required:
- `PORT`
- `NODE_ENV`
- `CLIENT_URL`
- `MONGO_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `GOOGLE_CLIENT_ID`
- `API_BASE_URL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

## Run Locally
1. Install dependencies:
```bash
npm install
```
2. Configure `.env`.
3. Start dev server:
```bash
npm run dev
```

## API Endpoints
Base prefix: `/api/auth`

### Public
- `POST /register`
- `GET /verify-email/:token`
- `POST /login`
- `POST /google`
- `POST /refresh`
- `POST /logout`

### Protected
- `GET /me`
- `PUT /avatar`

Health:
- `GET /api/health`
- `GET /`

## Authentication Flow
1. User registers (`/register`).
2. Backend creates verification token and sends verification email.
3. User clicks verify link (`/verify-email/:token`).
4. `isEmailVerified` becomes `true`.
5. User logs in (`/login`) and receives access token + refresh cookie.
6. Protected routes use `Authorization: Bearer <access_token>`.
7. Access token refresh via `/refresh` using refresh cookie.

## Google Auth Flow
1. Frontend gets Google `idToken`.
2. Frontend sends `idToken` to `POST /api/auth/google`.
3. Backend verifies token with Google client id.
4. User is created or updated, then JWT tokens are issued.

## Postman
Import:
- `postman/LMS-Backend.postman_collection.json`
- `postman/LMS-Backend.postman_environment.json`

Collection scripts already:
- store `access_token` after login/google login
- auto-attach `Authorization` for protected requests

## Security Notes
- Never commit `.env`.
- Rotate any leaked SMTP/API/JWT secrets.
- Use verified sender/domain in Brevo.
- Use HTTPS in production for secure cookies.

## Known Next Improvements
- Password reset flow
- Resend verification email endpoint
- Rate limit customization per route
- Audit logs for auth events
- Optional 2FA

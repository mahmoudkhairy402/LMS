# How To Extract This Auth As A Starter Project

This guide helps you separate current authentication into a reusable starter for future projects.

## Goal
Create a standalone `auth-starter-backend` that can be copied into any Node.js project.

## Keep These Files
- `app.js` (or move auth wiring into your main app)
- `config/db.js`
- `models/user.model.js`
- `controllers/auth.controller.js`
- `routes/auth.route.js`
- `middlewares/auth.middleware.js`
- `middlewares/validate.middleware.js`
- `middlewares/errorHandler.middleware.js`
- `middlewares/notFound.middleware.js`
- `validators/auth.validator.js`
- `utils/appError.js`
- `utils/asyncHandler.js`
- `utils/sendEmail.js`
- `utils/verifyGoogleIdToken.js`
- `postman/` files
- `.env.example`

## Starter Setup Steps
1. Copy files above into new project.
2. Install dependencies from `package.json`.
3. Add required env values.
4. Mount route:
```js
app.use('/api/auth', authRoutes);
```
5. Keep middleware order:
- body parsers
- cookies
- routes
- notFound
- errorHandler

## Integration Contract
Your frontend should rely on:
- `POST /api/auth/register`
- `GET /api/auth/verify-email/:token`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `PUT /api/auth/avatar`

## Required Env For Starter
- `MONGO_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `GOOGLE_CLIENT_ID`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `API_BASE_URL`

## Reuse Tips
- Keep user role enum generic (student/instructor/admin can be replaced).
- Keep token expiry values configurable only from env.
- Keep all response shapes stable to avoid frontend breakage.
- Add versioning if multiple projects consume this starter.

## Recommended Next Step
Turn this into an npm package or internal git template repo after one successful reuse.

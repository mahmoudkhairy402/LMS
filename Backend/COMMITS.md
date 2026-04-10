# Authentication Journey Commit Plan

Use these commits to keep history clean and reusable.

## Suggested Commit Sequence

1. `chore(backend): initialize express backend structure`
- create folders: config, routes, controllers, models, middlewares, utils, validators
- add app bootstrap and base scripts

2. `feat(core): add mongodb connection and global middlewares`
- connect mongoose
- add cors, helmet, rate-limit, cookie-parser, morgan
- add health route

3. `feat(errors): add AppError, asyncHandler and global error pipeline`
- add centralized error handling
- add 404 middleware

4. `feat(auth): add user model and email/password authentication`
- register, login, refresh, logout, me
- password hashing and compare method
- refresh token cookie flow

5. `feat(auth): block login for unverified emails`
- enforce email verification before login

6. `feat(email): add email verification flow`
- add verification token fields
- send verification email
- add verify-email endpoint

7. `feat(auth): add google login with idToken verification`
- add google-auth-library utility
- add `/api/auth/google` endpoint
- create/update user from Google payload

8. `feat(profile): add avatar support and update avatar endpoint`
- add avatar field in user model
- add protected `PUT /api/auth/avatar`

9. `docs(postman): add postman collection and environment`
- include dynamic variables
- add token auto-save scripts

10. `docs(readme): add complete backend auth documentation`
- setup steps
- env variables
- route reference
- auth flow and starter guidance

## Single Squash Commit Option
If you want one commit for extraction as starter:

`feat(auth-starter): complete reusable auth module (email verification + google + jwt + avatar + postman docs)`

## Conventional Commit Templates
- `feat(auth): ...`
- `fix(auth): ...`
- `chore(auth): ...`
- `docs(auth): ...`
- `refactor(auth): ...`

## Notes
- Keep secrets out of commits (`.env` must be ignored).
- Commit `.env.example` updates whenever you add new env variables.
- Prefer one logical change per commit for easy reuse in future projects.

# Nexora AI

Nexora AI uses a team of AI agents to research topics and create concise reports with findings, benefits, challenges, and references. Users can save reports, revisit them, download them as text files, and share feedback.

Research uses OpenRouter models with role-specific output limits:

- **Researcher — `liquid/lfm-3-1.7b:free` (300 tokens):** gathers concise research notes and source URLs.
- **Analyst — `dots-studio/dots-3-note-preview:free` (200 tokens):** reviews the notes for unsupported claims and uncertainty.
- **Writer — `dots-studio/dots-3-note-preview:free` (700 tokens):** produces the structured report with findings, benefits, challenges, and references.

## Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS, Motion, Axios, and Lucide React.
- **Backend:** Python 3.13, Flask (async), AutoGen AgentChat, and SQLAlchemy (async).
- **AI models:** OpenRouter-hosted models; Liquid LFM for research and Dots 3 Note Preview for analysis and report writing.
- **Data and migrations:** PostgreSQL, Redis, and Alembic.
- **Authentication and email:** JWT-based authentication, SMTP, and a Redis-backed email worker.
- **Development and deployment:** Docker Compose, npm, and Python `unittest`.

## API Endpoints

The API base path is `/api`.

| Method | Endpoint | Authentication | Description |
|---|---|---|---|
| `GET` | `/api/test` | No | Check API availability. |
| `POST` | `/api/auth/signup` | No | Create an account (`name`, `email`, `password`). |
| `POST` | `/api/auth/signin` | No | Sign in with `email` and `password`; returns an access token. |
| `GET` | `/api/auth/profile` | Bearer token | Get the signed-in user's profile. |
| `PATCH` | `/api/auth/profile` | Bearer token | Update the user's `name` and/or `email`. |
| `DELETE` | `/api/auth/profile` | Bearer token | Delete the signed-in user's account. |
| `POST` | `/api/auth/reset-password` | No | Send a password-reset verification code to an email address. |
| `POST` | `/api/auth/resend-otp` | No | Resend a password-reset verification code. |
| `POST` | `/api/auth/verify-otp` | No | Verify `email` and six-digit `otp`; returns a reset token. |
| `POST` | `/api/auth/update-password` | No | Set `new_password` using `email` and the returned `reset_token`. |
| `POST` | `/api/research` | Bearer token | Generate a report from a `topic`. |
| `GET` | `/api/reports` | Bearer token | List the signed-in user's saved reports. |
| `POST` | `/api/reports` | Bearer token | Save a report. Requires `title`, `introduction`, `background`, `key_findings`, `benefits`, `challenges`, `conclusion`, and `references`. |
| `DELETE` | `/api/reports/<report_id>` | Bearer token | Delete a saved report owned by the signed-in user. |
| `POST` | `/api/feedback` | No | Submit feedback (`name`, `email`, `message`). |

## Requirements

- Docker and Docker Compose
- Python 3.13
- Node.js 20.9 or later and npm
- An OpenRouter API key

## Run

1. Create `backend/.env`:

   ```env
   SECRET_KEY=
   DATABASE_URL=
   OPENROUTER_API_KEY=
   SMTP_HOST=
   SMTP_PORT=
   SMTP_USERNAME=
   SMTP_PASSWORD=
   SMTP_FROM_EMAIL=
   FEEDBACK_RECIPIENT_EMAIL=
   ```

2. Start the backend, PostgreSQL, Redis, and email worker:

   ```powershell
   cd backend
   docker compose up --build
   ```

   Docker Compose starts the email worker automatically. If running the backend outside Docker, start the worker in a separate terminal from `backend`:

   ```powershell
   .\env\Scripts\python.exe -m services.email_worker
   ```

3. Create `frontend/.env.local`:

   ```env
   NEXT_PUBLIC_API_URL=http://127.0.0.1:5000/api
   ```

4. In a second terminal, start the frontend:

   ```powershell
   cd frontend
   npm ci
   npm run dev
   ```

   Open `http://localhost:3000`.

## Database migrations

Docker Compose applies database migrations when the backend starts. To manage migrations manually, run commands from `backend` with `DATABASE_URL` configured:

```powershell
.\env\Scripts\alembic.exe -c alembic.ini upgrade head
```

For an existing database created before Alembic migrations were introduced, mark its schema as the initial baseline before applying future migrations:

```powershell
.\env\Scripts\alembic.exe -c alembic.ini stamp 0001_initial_schema
```

## Tests

Run backend tests from `backend`:

```powershell
.\env\Scripts\python.exe -m unittest discover -v
```

Run frontend checks from `frontend`:

```powershell
npm run lint
npm run build
```
## Screenshots of All Pages

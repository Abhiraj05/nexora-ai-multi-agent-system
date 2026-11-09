# Nexora

Nexora is an AI-powered research report application. The Next.js frontend connects to a Flask API for accounts, password recovery, feedback, and report persistence. Research generation uses AutoGen agents and OpenRouter-hosted models. PostgreSQL stores users and reports; Redis stores short-lived password-reset state and queues email jobs.

## Requirements

- Python 3.10 or later
- Node.js 20.9 or later and npm
- PostgreSQL
- Redis
- An OpenRouter API key for research generation
- SMTP credentials for signup, password-reset, and feedback email

## Setup

### 1. Configure the backend

From the repository root, create `backend/.env`:

```env
SECRET_KEY=replace-with-a-long-random-secret
POSTGRES_PASSWORD=replace-with-a-strong-database-password
DATABASE_URL=postgresql://user:password@localhost:5432/nexora
REDIS_URL=redis://localhost:6379
OPENROUTER_API_KEY=replace-with-your-openrouter-api-key

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=your-smtp-username
SMTP_PASSWORD=your-smtp-password
SMTP_FROM_EMAIL=verified-sender@example.com
FEEDBACK_RECIPIENT_EMAIL=feedback-recipient@example.com
```

Replace the example values with credentials for your services. Keep `.env` files private and do not commit secrets.
The backend uses only `OPENROUTER_API_KEY` for OpenRouter authentication. Research uses OpenRouter's `liquid/lfm-3-1.7b:free` model, which is listed at zero cost and supports structured outputs. Free-model availability and rate limits are controlled by OpenRouter and may change.

To run the backend with Docker Compose instead, set `SECRET_KEY` and
`POSTGRES_PASSWORD` in `backend/.env`, then run from the `backend` directory:

```powershell
docker compose up --build
```

Compose starts the Flask API, email worker, PostgreSQL, and Redis, applies
database migrations, and persists database/cache data in named volumes. The API
listens at `http://127.0.0.1:5000`. Email jobs are queued in Redis lists and
rendered by the worker using Jinja2. Failed jobs are retried up to three times;
jobs that still fail are kept in the `queue:emails:failed` Redis list.

Create and activate a virtual environment, then install backend dependencies:

```powershell
cd backend
python -m venv env
.\env\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

On macOS/Linux, activate with `source env/bin/activate`.

Apply the initial database migration:

```powershell
.\env\Scripts\alembic.exe -c alembic.ini upgrade head
```

For a database whose tables were created by the old `create_all()` startup behavior, do not run the initial migration against those tables. Mark the existing schema as the baseline:

```powershell
.\env\Scripts\alembic.exe -c alembic.ini stamp 0001_initial_schema
```

See [backend/MIGRATIONS.md](backend/MIGRATIONS.md) before applying changes to an existing or shared database.

Start the backend from the `backend` directory:

```powershell
python app.py
```

The Flask API listens at `http://127.0.0.1:5000`.
In a second terminal from `backend`, run the email worker:

```powershell
python -m services.email_worker
```

### 2. Configure and start the frontend

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:5000/api
```

`NEXT_PUBLIC_API_URL` is used by browser-side Axios calls to the Flask API, including authentication, OTP verification, feedback, reports, and research. Configure the Flask CORS allowed origin to match the frontend host when deploying outside local development.

In another terminal:

```powershell
cd frontend
npm ci
npm run dev
```

Open `http://localhost:3000`.

## API routes

The JSX pages and components call the Flask API directly using Axios and `NEXT_PUBLIC_API_URL`:

| Backend route | Purpose |
| --- | --- |
| `POST /api/auth/signup` | Create an account |
| `POST /api/auth/signin` | Sign in |
| `POST /api/auth/reset-password` | Send a reset OTP |
| `POST /api/auth/verify-otp` | Verify OTP |
| `POST /api/auth/update-password` | Set a new password |
| `POST /api/auth/resend-otp` | Resend an OTP |
| `POST /api/feedback` | Send feedback |
| `GET /api/reports` | List reports for the signed-in user |
| `POST /api/reports` | Save a report |
| `POST /api/research` | Generate a research report |

Flask also provides `GET /api/test`.

## Tests and checks

Run backend tests and Python compilation from the `backend` directory:

```powershell
.\env\Scripts\python.exe -m unittest discover -v
.\env\Scripts\python.exe -m compileall -q app.py auth db migrations router schemas services sql tests
```

Run frontend lint and production build from `frontend`:

```powershell
npm run lint
npm run build
```

## Database migrations

Create a new revision after changing SQLAlchemy models:

```powershell
.\env\Scripts\alembic.exe -c alembic.ini revision --autogenerate -m "describe schema change"
```

Review the generated migration before applying it, then use `upgrade head`. Back up databases before migrations, especially in shared or production environments.

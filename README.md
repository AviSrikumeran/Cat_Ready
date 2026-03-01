# Cat Ready

Built for HackIllinois 2026 in collaboration with Caterpillar. Cat Ready is a voice-first, multimodal pre-op inspection assistant for heavy equipment—operators walk the machine, speak each check, snap a photo if needed, and Cat Ready verifies, logs, and auto-summarizes the inspection.

## Project structure

- **Backend (Django)** – REST API for inspections: create inspections, submit steps (audio + images), STT + vision + LLM pipeline, PASS/FAIL/UNSURE results.
- **Frontend (`frontend/`)** – Next.js app: landing page, machine selection, inspection capture (photos + voice), and results. **Wired to the backend**: creates inspections, submits steps with real photos and audio, and shows PASS/FAIL/UNSURE from the API.

## Running the backend

```bash
# From project root
python -m venv .venv && source .venv/bin/activate  # or: .venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env   # add OPENAI_API_KEY
python manage.py migrate
python manage.py runserver
```

API: `http://127.0.0.1:8000/` (see `inspections/urls.py` for endpoints).

## Running the frontend

```bash
# From project root
cd frontend
pnpm install
cp .env.example .env   # optional: set NEXT_PUBLIC_API_URL if backend is not at http://localhost:8000
pnpm dev
```

App: `http://localhost:3000`. The frontend calls the backend at `NEXT_PUBLIC_API_URL` (default `http://localhost:8000/api`). Run the Django server first so inspections and steps are processed.

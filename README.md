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

## Testing on another device (phone / tablet)

To use the app from your phone or another computer on the same Wi‑Fi:

1. **Get your laptop’s IP** (e.g. System Settings → Network, or `ifconfig` / `ipconfig`). Example: `192.168.1.105`.

2. **Start the backend** so it accepts connections from other devices:
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```

3. **Point the frontend at that IP** by setting in `frontend/.env.local` (or `frontend/.env`):
   ```
   NEXT_PUBLIC_API_URL=http://192.168.1.105:8000/api
   ```
   (Use your real IP instead of `192.168.1.105`.)

4. **Start the frontend** so it’s reachable on the network:
   ```bash
   cd frontend && pnpm dev:phone
   ```

5. **On your phone** (same Wi‑Fi), open in the browser:
   ```
   http://192.168.1.105:3000
   ```

In debug mode the backend allows any host. If the phone can’t connect, check the laptop firewall (allow ports 3000 and 8000) or try on a home network; some public Wi‑Fi blocks device-to-device traffic.

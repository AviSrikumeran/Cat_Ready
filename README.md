# Cat Ready

Voice-first, multimodal pre-op inspection assistant for heavy equipment. Operators walk the machine, speak each check, optionally snap a photo when there’s an issue, and Cat Ready transcribes speech, analyzes images, and returns PASS / FAIL / UNSURE with a summary—built for HackIllinois 2026 in collaboration with Caterpillar.

---

## What we built

- **Landing page** – Marketing site (hero, problem, how it works, voice demo, value props, app preview) with links to start an inspection.
- **Checklist-driven inspection** – Single product flow (CAT 982 Medium Wheel Loader) based on a daily safety & maintenance checklist: sections A–D with steps for tires, bucket, drivetrain, fluids, cab, engine, etc.
- **Voice-first capture** – Per-step recording in the browser (microphone). Audio is sent to the backend and transcribed with **OpenAI Whisper** (STT). Optional photos per step for issues; images are described with **OpenAI Vision** and fed into the evaluation.
- **AI evaluation** – Backend runs STT → vision (for images) → LLM. The LLM maps transcript + image descriptions to **PASS**, **FAIL**, or **UNSURE** with a short reason.
- **Results & QR** – Results page shows overall status, step-by-step outcomes, and transcript/reason per step. Includes a QR code for the inspection and a “Scan QR code” button (camera) to read QR codes.
- **Backend API** – Django REST API: create inspection, submit steps (multipart: audio + images), persist steps and media; orchestration (STT, vision, LLM) and CORS for the Next.js frontend.

**Tech:** Django, DRF, OpenAI (Whisper, GPT-4o vision, GPT-4o-mini for evaluation), Next.js 15, Tailwind, Framer Motion, QR display + scanner.

---

## Project structure

| Area | Description |
|------|-------------|
| **Backend** | Django app in project root. `inspections/`: models (Inspection, InspectionStep, StepImage), views (REST), services (STT → vision → LLM), `stt.py`, `vision.py`, `llm.py`. Media (audio/images) under `media/`. |
| **Frontend** | Next.js in `frontend/`. Landing: `app/page.tsx` + `components/landing/*`. Inspect flow: `app/inspect/page.tsx`, `components/inspect/*` (start, capture, results, QR scanner). Checklist: `lib/checklist.ts`. API client: `lib/api.ts`. |
| **Checklist source** | `example_checklist.md` describes the CAT 982 daily inspection categories and items. |

---

## Run locally

### 1. Backend (Django)

From the **project root**:

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` in the project root with your OpenAI API key (required for voice and image analysis):

```bash
OPENAI_API_KEY=sk-your-key-here
```

Then:

```bash
python manage.py migrate
python manage.py runserver
```

- API base: **http://localhost:8000**
- Inspections: `GET/POST /api/inspections/`, `GET /api/inspections/<id>/`, `POST /api/inspections/<id>/steps/`

### 2. Frontend (Next.js)

In a **second terminal**, from the project root:

```bash
cd frontend
pnpm install
```

Optional: if the backend is not at `http://localhost:8000`, create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Then:

```bash
pnpm dev
```

- App: **http://localhost:3000**
- Use **http://localhost:3000** (or **http://127.0.0.1:3000**) so the browser allows microphone access for recording.

### 3. Quick check

1. Open **http://localhost:3000** → landing page.
2. Click **Start Inspection** → CAT 982 flow.
3. For at least one step, allow the microphone when prompted, record a short phrase, then add photos if you like and submit. Results should show transcript and PASS/FAIL/UNSURE.

If transcript is empty, check the Django runserver log for STT messages (e.g. missing `OPENAI_API_KEY` or Whisper errors). Backend logs when it receives audio and when STT is skipped or fails.

---

## Testing on another device (same network)

To use the app from a phone or another computer on the same Wi‑Fi:

1. **Get your laptop’s IP** (e.g. System Settings → Network, or `ifconfig` / `ipconfig`). Example: `192.168.1.105`.

2. **Start the backend** so it accepts connections from other devices:
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```

3. **Point the frontend at that IP** in `frontend/.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://192.168.1.105:8000/api
   ```
   (Use your real IP.)

4. **Start the frontend** so it’s reachable on the network:
   ```bash
   cd frontend && pnpm dev:phone
   ```

5. **On the other device** (same Wi‑Fi), open: `http://192.168.1.105:3000`.

**Note:** Microphone recording may be blocked on non-HTTPS, non-localhost origins in some browsers. For reliable voice input, test recording on **localhost** first. Some public Wi‑Fi networks block device-to-device traffic; try a home network and ensure the firewall allows ports 3000 and 8000.

---

## Environment variables

| Variable | Where | Purpose |
|----------|--------|---------|
| `OPENAI_API_KEY` | Backend `.env` (project root) | Whisper (STT), Vision, and LLM. Required for voice and image evaluation. |
| `NEXT_PUBLIC_API_URL` | Frontend `.env.local` or `.env` | Backend API base URL (e.g. `http://localhost:8000/api`). Default used by frontend if unset. |

Optional backend (in `.env`): `OPENAI_STT_MODEL`, `OPENAI_VISION_MODEL`, `OPENAI_LLM_MODEL`, `DEBUG`, `ALLOWED_HOSTS`.

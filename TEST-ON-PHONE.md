# Test Cat Ready on Your Phone

Use this guide to run the app on your phone over the same Wi‑Fi as your computer.

---

## What you need

- Computer and phone on the **same Wi‑Fi**
- Backend and frontend already set up (see [README.md](README.md))

---

## Step 1: Start the backend

From the **project root**:

```bash
./scripts/run-backend-phone.sh
```

The script will:

- Print your computer’s **local IP** (e.g. `192.168.1.42`) — you’ll need this in the next steps
- Start Django on `0.0.0.0:8000` so your phone can reach it

**Alternative** (if the script doesn’t work):

```bash
python manage.py runserver 0.0.0.0:8000
```

To find your IP manually on Mac: **System Settings → Network → Wi‑Fi → Details**, or run:

```bash
ipconfig getifaddr en0
```

Leave this terminal running.

---

## Step 2: Set the frontend API URL

In the `frontend` folder, create or edit `.env.local` so the app on your phone calls your computer’s API:

```bash
cd frontend
cp .env.local.example .env.local
```

Open `frontend/.env.local` and set (replace with **your** IP from Step 1):

```
NEXT_PUBLIC_API_URL=http://192.168.1.42:8000/api
```

Save the file.

---

## Step 3: Start the frontend

In a **second terminal**:

```bash
cd frontend
pnpm dev:phone
```

This runs the Next.js app so it’s reachable on your network at `http://YOUR_IP:3000`. Leave this running.

---

## Step 4: Open the app on your phone

On your phone’s browser (Chrome or Safari), go to:

```
http://YOUR_IP:3000
```

Use the **same IP** as in Step 2 (e.g. `http://192.168.1.42:3000`).

Bookmark this URL for quick access. Then:

1. Tap **Inspect** (or go to the inspect flow).
2. Select a machine.
3. Add photos and optional voice notes per category.
4. Submit and view results; the QR code will show the inspection summary.

Camera and microphone will use the phone’s hardware.

---

## Troubleshooting

| Problem | What to try |
|--------|-------------|
| Phone can’t load the page | Confirm phone and computer are on the same Wi‑Fi. Check firewall isn’t blocking ports 3000 or 8000. |
| “DisallowedHost” or 400 from Django | Backend should auto-allow your LAN IP in DEBUG. Restart the backend after changing network. |
| Inspect submit fails / network error | Ensure `NEXT_PUBLIC_API_URL` in `frontend/.env.local` uses your computer’s IP and port 8000. Restart `pnpm dev:phone` after changing `.env.local`. |
| Camera or mic not working on phone | Use a modern browser (Chrome or Safari). Grant camera/microphone when the site asks. Use HTTPS only if you’ve set it up (otherwise HTTP is fine on local IP). |

---

## Quick reference

| Item | Value |
|------|--------|
| App on phone | `http://YOUR_IP:3000` |
| API base (in `.env.local`) | `http://YOUR_IP:8000/api` |
| Backend command | `./scripts/run-backend-phone.sh` or `python manage.py runserver 0.0.0.0:8000` |
| Frontend command | `pnpm dev:phone` (from `frontend/`) |

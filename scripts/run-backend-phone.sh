#!/usr/bin/env bash
# Run Django so your phone (on same Wi‑Fi) can reach the API.
# From project root: ./scripts/run-backend-phone.sh
# Or: bash scripts/run-backend-phone.sh

set -e
cd "$(dirname "$0")/.."

# Show local IP so you can use it in frontend .env.local
if command -v python3 &>/dev/null; then
  IP=$(python3 -c "
import socket
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.connect(('8.8.8.8', 80))
print(s.getsockname()[0])
s.close()
" 2>/dev/null || true)
elif command -v ipconfig &>/dev/null; then
  IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)
fi

if [ -n "$IP" ]; then
  echo "→ Phone testing: use this IP for the app and API: $IP"
  echo "→ In frontend/.env.local set: NEXT_PUBLIC_API_URL=http://$IP:8000/api"
  echo "→ On your phone open: http://$IP:3000"
  echo ""
fi

exec python manage.py runserver 0.0.0.0:8000

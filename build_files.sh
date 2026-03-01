#!/bin/bash
set -e
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# Run migrations if DATABASE_URL is set (e.g. Vercel + ElephantSQL)
if [ -n "$DATABASE_URL" ]; then
  python manage.py migrate --noinput
fi
python manage.py collectstatic --no-input --clear

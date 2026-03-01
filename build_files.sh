#!/bin/bash
set -e
pip install -r requirements.txt
# Run migrations if DATABASE_URL is set (e.g. Vercel + ElephantSQL)
if [ -n "$DATABASE_URL" ]; then
  python3.11 manage.py migrate --noinput
fi
python3.11 manage.py collectstatic --no-input --clear

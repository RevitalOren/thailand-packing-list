#!/bin/sh
# Hourly backup of the Thailand packing-list data from Render.
# Installed in crontab: runs at minute 0 of every hour.
DIR="/Users/agentsmith/agent mini jonathan/thailand-packing-list/backups"
OUT="$DIR/backup-$(date +%Y%m%d-%H%M).json"
TMP="$OUT.tmp"

curl -s -m 60 "https://thailand-packing-list.onrender.com/api/family-data" -o "$TMP" || exit 1

# Only keep it if it's valid JSON with data (don't overwrite good backups with errors)
if python3 -c "import json,sys; d=json.load(open('$TMP')); assert d.get('success') and d.get('data')" 2>/dev/null; then
  mv "$TMP" "$OUT"
else
  rm -f "$TMP"
  exit 1
fi

# Keep only the newest 100 hourly backups
ls -t "$DIR"/backup-*.json 2>/dev/null | tail -n +101 | while read -r f; do rm -f "$f"; done

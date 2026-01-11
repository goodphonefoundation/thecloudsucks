#!/bin/sh
set -e
mkdir -p /root/.config/trigger
cat > /root/.config/trigger/config.json <<'JSON'
{
  "version": 2,
  "currentProfile": "local",
  "profiles": {
    "local": {
      "apiUrl": "http://trigger-webapp-1:3000",
      "accessToken": "__PAT__",
      "projectRef": "__PROJ__"
    }
  }
}
JSON
# Inject secrets from env
sed -i "s/__PAT__/${TRIGGER_ACCESS_TOKEN}/g" /root/.config/trigger/config.json
sed -i "s/__PROJ__/${TRIGGER_PROJECT_REF}/g" /root/.config/trigger/config.json
exec npx trigger.dev@latest dev --profile local --skip-update-check

#!/usr/bin/env bash
# Install system-wide systemd units for TV España (proxy + Vite).
# Run from the repo root: sudo ./deploy/install-systemd.sh
set -euo pipefail

if [[ "${EUID:-0}" -ne 0 ]]; then
  echo "Run as root: sudo $0" >&2
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SVC_USER="${TV_ESP_USER:-$(logname 2>/dev/null || echo "${SUDO_USER:-$USER}")}"
SVC_GROUP="$(id -gn "$SVC_USER")"

if [[ ! -d "$REPO_ROOT/node_modules" ]]; then
  echo "Missing node_modules in $REPO_ROOT — run: npm install" >&2
  exit 1
fi

# Free ports if something else (old manual run) is bound
fuser -k 3555/tcp >/dev/null 2>&1 || true
fuser -k 5173/tcp >/dev/null 2>&1 || true
sleep 1

UNIT_DIR=/etc/systemd/system
for unit in tv-esp-proxy tv-esp-web; do
  sed -e "s|INSTALL_DIR|${REPO_ROOT}|g" \
      -e "s|SVC_USER|${SVC_USER}|g" \
      -e "s|SVC_GROUP|${SVC_GROUP}|g" \
    "${REPO_ROOT}/deploy/${unit}.service" > "${UNIT_DIR}/${unit}.service"
done

systemctl daemon-reload
systemctl enable tv-esp-proxy.service tv-esp-web.service
systemctl restart tv-esp-proxy.service
systemctl restart tv-esp-web.service

echo "Installed for user ${SVC_USER} (group ${SVC_GROUP}), directory ${REPO_ROOT}"
echo "Status:"
systemctl --no-pager --full status tv-esp-proxy.service tv-esp-web.service || true
echo ""
echo "Logs: journalctl -u tv-esp-proxy -u tv-esp-web -f"
echo "Restart: sudo systemctl restart tv-esp-proxy tv-esp-web"

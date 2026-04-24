#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PB_DIR="$ROOT_DIR/pocketbase"
PB_BIN="$PB_DIR/pocketbase"
PB_VERSION="${PB_VERSION:-0.37.3}"
PB_HTTP="${PB_HTTP:-127.0.0.1:8090}"

mkdir -p "$PB_DIR"

detect_os() {
  case "$(uname -s)" in
    Darwin) echo "darwin" ;;
    Linux) echo "linux" ;;
    *)
      echo "Unsupported OS: $(uname -s)" >&2
      exit 1
      ;;
  esac
}

detect_arch() {
  case "$(uname -m)" in
    arm64|aarch64) echo "arm64" ;;
    x86_64) echo "amd64" ;;
    *)
      echo "Unsupported architecture: $(uname -m)" >&2
      exit 1
      ;;
  esac
}

download_pocketbase() {
  local os arch archive_url tmp_zip
  os="$(detect_os)"
  arch="$(detect_arch)"
  tmp_zip="$(mktemp)"
  archive_url="https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_${os}_${arch}.zip"

  echo "Downloading PocketBase ${PB_VERSION} for ${os}_${arch}..."
  curl -fsSL "$archive_url" -o "$tmp_zip"
  unzip -o "$tmp_zip" -d "$PB_DIR" >/dev/null
  rm -f "$tmp_zip"
  chmod +x "$PB_BIN"
}

if [ ! -x "$PB_BIN" ]; then
  download_pocketbase
fi

if [ ! -f "$PB_DIR/pb_data/data.db" ] && [ -n "${PB_SUPERUSER_EMAIL:-}" ] && [ -n "${PB_SUPERUSER_PASSWORD:-}" ]; then
  echo "Creating initial PocketBase superuser..."
  (
    cd "$PB_DIR"
    "$PB_BIN" superuser create "$PB_SUPERUSER_EMAIL" "$PB_SUPERUSER_PASSWORD"
  )
fi

cd "$PB_DIR"
exec "$PB_BIN" serve --http="$PB_HTTP"

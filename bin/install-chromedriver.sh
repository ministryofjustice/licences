#!/usr/bin/env bash
# Installs the chromedriver matching the locally installed Chrome (macOS / Linux)
# and symlinks it into a directory on PATH (default: ~/.local/bin).
# Usage: bin/install-chromedriver.sh [link-dir]
set -euo pipefail

LINK_DIR="${1:-$HOME/.local/bin}"
INSTALL_ROOT="${CHROMEDRIVER_HOME:-$HOME/.bin}"

case "$(uname -s)-$(uname -m)" in
  Darwin-arm64) PLATFORM=mac-arm64 ;;
  Darwin-x86_64) PLATFORM=mac-x64 ;;
  Linux-x86_64) PLATFORM=linux64 ;;
  *) echo "Unsupported platform" >&2; exit 1 ;;
esac

if [[ "$(uname -s)" == "Darwin" ]]; then
  CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
else
  CHROME="$(command -v google-chrome || command -v google-chrome-stable || true)"
fi
[[ -x "$CHROME" ]] || { echo "Chrome not found" >&2; exit 1; }

CHROME_VERSION="$("$CHROME" --version | grep -Eo '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | head -1 || true)"
[[ -n "$CHROME_VERSION" ]] || { echo "Could not determine Chrome version" >&2; exit 1; }
MAJOR="${CHROME_VERSION%%.*}"
BUILD="${CHROME_VERSION%.*}"
echo "Chrome version: $CHROME_VERSION"

# Exact build match from Chrome for Testing, falling back to latest for the major version
DRIVER_VERSION="$(curl -fsSL https://googlechromelabs.github.io/chrome-for-testing/latest-patch-versions-per-build.json \
  | python3 -c "import json,sys; print(json.load(sys.stdin)['builds'].get(sys.argv[1],{}).get('version',''))" "$BUILD")"
if [[ -z "$DRIVER_VERSION" ]]; then
  DRIVER_VERSION="$(curl -fsSL https://googlechromelabs.github.io/chrome-for-testing/latest-versions-per-milestone.json \
    | python3 -c "import json,sys; print(json.load(sys.stdin)['milestones'].get(sys.argv[1],{}).get('version',''))" "$MAJOR")"
fi
[[ -n "$DRIVER_VERSION" ]] || { echo "No chromedriver found for Chrome $CHROME_VERSION" >&2; exit 1; }
echo "Chromedriver version: $DRIVER_VERSION"

DEST="$INSTALL_ROOT/chromedriver-$DRIVER_VERSION-$PLATFORM"
if [[ ! -x "$DEST/chromedriver" ]]; then
  TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
  curl -fsSL -o "$TMP/cd.zip" "https://storage.googleapis.com/chrome-for-testing-public/$DRIVER_VERSION/$PLATFORM/chromedriver-$PLATFORM.zip"
  unzip -q "$TMP/cd.zip" -d "$TMP"
  mkdir -p "$DEST"
  mv "$TMP/chromedriver-$PLATFORM/"* "$DEST/"
  chmod +x "$DEST/chromedriver"
  [[ "$(uname -s)" == "Darwin" ]] && xattr -dr com.apple.quarantine "$DEST" 2>/dev/null || true
fi

mkdir -p "$LINK_DIR"
ln -sfn "$DEST/chromedriver" "$LINK_DIR/chromedriver"
echo "Linked $LINK_DIR/chromedriver -> $DEST/chromedriver"

# Verify the chromedriver resolved from the real PATH is ours
ACTIVE="$(command -v chromedriver || true)"
if [[ "$ACTIVE" != "$LINK_DIR/chromedriver" ]]; then
  echo "Warning: '${ACTIVE:-none}' is what your PATH currently resolves; $LINK_DIR must come first on PATH." >&2
  echo "Add to your shell rc:  export PATH=\"$LINK_DIR:\$PATH\"" >&2
fi
"$LINK_DIR/chromedriver" --version

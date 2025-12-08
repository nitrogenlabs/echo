#!/usr/bin/env bash
#
# Project Echo – Cross-Platform Setup Script
# -----------------------------------------
# This script will:
#  1. Update system packages
#  2. Install system dependencies
#  3. Install Node.js 24
#  4. Clone (or update) the Project Echo repo
#  5. Create a Python venv and install requirements
#  6. Optionally install the Akida SDK .whl (Linux only)
#
# Supports: macOS (development) and Linux/Raspberry Pi (hardware)

set -e

REPO_URL="https://github.com/nitrogenlabs/project-echo.git"
REPO_DIR="project-echo"
PYTHON_BIN="python3"
VENV_DIR="venv"

# Detect OS
OS="$(uname -s)"
case "${OS}" in
  Linux*)     PLATFORM="linux" ;;
  Darwin*)    PLATFORM="macos" ;;
  *)          echo "Unsupported OS: ${OS}"; exit 1 ;;
esac

echo "======================================"
echo "  Project Echo – Setup Script"
echo "  Platform: ${PLATFORM}"
echo "======================================"
echo

# --- 1. Update system packages ---------------------------------------------
echo "[1/6] Updating system packages..."

if [ "$PLATFORM" = "macos" ]; then
  # Check if Homebrew is installed
  if ! command -v brew &> /dev/null; then
    echo "Homebrew not found. Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  fi
  echo "Updating Homebrew..."
  brew update
elif [ "$PLATFORM" = "linux" ]; then
  echo "Updating apt packages..."
  sudo apt update && sudo apt upgrade -y
fi

# --- 2. Install system dependencies ----------------------------------------
echo "[2/6] Installing system dependencies..."

if [ "$PLATFORM" = "macos" ]; then
  # Check and install dependencies via Homebrew
  echo "Installing dependencies via Homebrew..."
  # Check if python3 is available (macOS usually has it)
  if ! command -v python3 &> /dev/null; then
    echo "python3 not found, installing via Homebrew..."
    brew install python3 || true
  else
    echo "python3 found: $(python3 --version)"
  fi
  # Install git and curl if needed
  brew install git curl || true  # || true to continue if already installed
  # Final check
  if ! command -v python3 &> /dev/null; then
    echo "Error: python3 not found after installation"
    exit 1
  fi
elif [ "$PLATFORM" = "linux" ]; then
  echo "Installing dependencies via apt..."
  sudo apt install -y \
    ${PYTHON_BIN} \
    python3-venv \
    python3-pip \
    git \
    build-essential \
    curl
fi

# --- 3. Install Node.js 24 --------------------------------------------------
echo "[3/6] Installing Node.js 24..."

if [ "$PLATFORM" = "macos" ]; then
  # Check if Node.js is already installed
  if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 24 ]; then
      echo "Node.js 24+ already installed: $(node -v)"
    else
      echo "Node.js version is $(node -v), upgrading to latest (may be 24+)..."
      brew upgrade node || brew install node
    fi
  else
    echo "Installing Node.js (latest version, typically 24+)..."
    brew install node
  fi
elif [ "$PLATFORM" = "linux" ]; then
  # Install Node.js 24 via NodeSource
  curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
  sudo apt install -y nodejs
fi

# Verify Node.js installation
if command -v node &> /dev/null; then
  echo "Node version: $(node -v)"
  echo "npm version:  $(npm -v)"
else
  echo "Warning: Node.js installation may have failed. Please install manually."
fi

# --- 4. Clone or update the repository -------------------------------------
echo "[4/6] Cloning or updating Project Echo repo..."

# Check if we're already in the repository
if [ -d ".git" ]; then
  echo "Already in Project Echo repository. Pulling latest changes..."
  git pull || echo "Note: Could not pull latest changes (may be on a branch or have local changes)"
elif [ -d "$REPO_DIR/.git" ]; then
  echo "Repository already exists. Pulling latest changes..."
  cd "$REPO_DIR"
  git pull || echo "Note: Could not pull latest changes (may be on a branch or have local changes)"
else
  echo "Cloning repository..."
  git clone "$REPO_URL" "$REPO_DIR"
  cd "$REPO_DIR"
fi

# --- 5. Python virtual environment & requirements ---------------------------
echo "[5/6] Setting up Python virtual environment..."

if [ ! -d "$VENV_DIR" ]; then
  ${PYTHON_BIN} -m venv "$VENV_DIR"
fi

# shellcheck source=/dev/null
source "$VENV_DIR/bin/activate"

if [ -f "requirements.txt" ]; then
  echo "Installing Python requirements..."
  pip install --upgrade pip
  pip install -r requirements.txt
else
  echo "No requirements.txt found. Skipping Python deps."
fi

# --- 6. Optional Akida SDK installation ------------------------------------
echo "[6/6] Akida SDK installation (optional)."

if [ "$PLATFORM" = "macos" ]; then
  echo "Akida SDK is not supported on macOS."
  echo "The SDK is only available for Linux (Raspberry Pi 5 with Akida hardware)."
  echo "You can run Project Echo in CPU-only mode for development."
elif [ "$PLATFORM" = "linux" ]; then
  read -r -p "Do you want to install the Akida SDK .whl now? [y/N]: " INSTALL_AKIDA

  if [[ "$INSTALL_AKIDA" =~ ^[Yy]$ ]]; then
    read -r -p "Enter full path to Akida .whl file: " AKIDA_WHL

    if [ -f "$AKIDA_WHL" ]; then
      echo "Installing Akida SDK from: $AKIDA_WHL"
      pip install "$AKIDA_WHL"
    else
      echo "File not found: $AKIDA_WHL"
      echo "Skipping Akida SDK install. You can install it manually later:"
      echo "  (venv) $ pip install /path/to/akida-<version>-linux_aarch64.whl"
    fi
  else
    echo "Skipping Akida SDK installation."
  fi
fi

echo
echo "======================================"
echo "  Setup Complete"
echo "======================================"
echo
echo "Next steps (from the repo root):"
echo "  1) Activate the venv:"
echo "       source venv/bin/activate"
if [ "$PLATFORM" = "linux" ]; then
  echo "  2) Verify Akida hardware (if installed):"
  echo "       python scripts/check_akida.py"
  echo "  3) (Optional) Run a demo inference:"
else
  echo "  2) (Optional) Run a demo inference (CPU mode):"
fi
echo "       python experiments/demo_inference.py"
echo "  4) (Optional) Start the NodeJS API:"
echo "       cd api"
echo "       npm install"
echo "       npm run dev"
echo
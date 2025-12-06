#!/usr/bin/env bash
#
# Project Echo – Raspberry Pi 5 Setup Script
# -----------------------------------------
# This script will:
#  1. Update apt packages
#  2. Install system dependencies
#  3. Install Node.js 24
#  4. Clone (or update) the Project Echo repo
#  5. Create a Python venv and install requirements
#  6. Optionally install the Akida SDK .whl
#

set -e

REPO_URL="https://github.com/nitrogenlabs/project-echo.git"
REPO_DIR="project-echo"
PYTHON_BIN="python3"
VENV_DIR="venv"

echo "======================================"
echo "  Project Echo – Setup Script"
echo "======================================"
echo

# --- 1. Update system packages ---------------------------------------------
echo "[1/6] Updating apt packages..."
sudo apt update && sudo apt upgrade -y

# --- 2. Install system dependencies ----------------------------------------
echo "[2/6] Installing system dependencies..."
sudo apt install -y \
  ${PYTHON_BIN} \
  python3-venv \
  python3-pip \
  git \
  build-essential \
  curl

# --- 3. Install Node.js 24 (via NodeSource) --------------------------------
echo "[3/6] Installing Node.js 24..."
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs

echo "Node version: $(node -v)"
echo "npm version:  $(npm -v)"

# --- 4. Clone or update the repository -------------------------------------
echo "[4/6] Cloning or updating Project Echo repo..."

if [ -d "$REPO_DIR/.git" ]; then
  echo "Repository already exists. Pulling latest changes..."
  cd "$REPO_DIR"
  git pull
else
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

echo
echo "======================================"
echo "  Setup Complete"
echo "======================================"
echo
echo "Next steps (from the repo root):"
echo "  1) Activate the venv:"
echo "       source venv/bin/activate"
echo "  2) (Optional) Run a demo inference:"
echo "       python echo-experiments/demo_inference.py"
echo "  3) (Optional) Start the NodeJS API:"
echo "       cd echo-api"
echo "       npm install"
echo "       npm run dev"
echo
# Project Echo

![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)
![Platform](https://img.shields.io/badge/platform-Raspberry%20Pi%205-orange.svg)
![Neuromorphic](https://img.shields.io/badge/neuromorphic-Akida-blueviolet.svg)
![Python](https://img.shields.io/badge/python-3.10%2B-blue.svg)
![NodeJS](https://img.shields.io/badge/nodejs-24%2B-green.svg)
![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)
![Status](https://img.shields.io/badge/status-Active%20Development-yellow.svg)

Neuromorphic Intelligence • Real-Time Edge Processing • Adaptive Learning Systems

---

## Overview

**Project Echo** is a research and development initiative focused on building a next-generation neuromorphic computing platform by combining:

- **Low-power edge hardware** (Raspberry Pi 5 + Akida M.2 neuromorphic accelerator)
- **Custom AI/ML pipelines** for event-driven spiking neural networks
- **A modular software stack** designed for real-time perception, inference, and adaptive learning
- **Lightweight experimentation tools** for rapid prototyping on embedded systems

Project Echo explores how biologically inspired architectures can enhance modern AI—reducing power consumption, increasing inference speed, and enabling on-device learning without cloud dependency.

The long-term goal is to create a flexible, scalable platform for edge-based intelligence capable of running autonomous systems, robotics, embedded agents, and advanced cognitive models.

---

## Core Features

- **Neuromorphic acceleration via Akida**
- **Event-driven inference & spiking neural networks**
- **Modular Python SDK for model building and experimentation**
- **Graph-based data and state management with ArangoDB (optional)**
- **REST + WebSocket interfaces for tool integration**
- **Extendable plugin system for new sensors and models**
- **Portable containerized builds for reproducibility**

---

## Hardware Requirements

### Minimum Setup

- Raspberry Pi 5 (4GB or 8GB recommended)
- Akida M.2 PCIe Card
- M.2 A+E to M-Key PCIe adapter for Raspberry Pi 5
- USB-C power supply (minimum 27W recommended)
- microSD card (64GB or larger)

### Optional / Recommended

- External SSD (USB 3.0) for faster storage
- Pi case with active cooling
- HDMI display or headless SSH configuration

---

## Software Requirements

### Host Machine

For development:

- NodeJS **24+**
- Python **3.10+**
- Docker/Podman (optional)

### Required Libraries

- Akida Python SDK
- @nlabs/reaktor (optional backend framework)
- ArangoDB (local or remote instance)
- NumPy, SciPy, scikit-learn
- Custom Echo utilities (included in `/echo/` directory)

---

## Project Structure

project-echo/
│
├── api/               # NodeJS REST API with WebSocket support
│   └── README.md      # [API Documentation](api/README.md)
├── ui/                # React + TypeScript web UI
│   └── README.md      # [UI Documentation](ui/README.md)
├── core/              # Core neuromorphic logic, Akida drivers, pipelines
├── docs/              # Extended documentation
├── experiments/       # Prototype SNN models, demos PoC notebooks
├── scripts/           # Deployment & setup scripts
├── tools/             # CLI tools, testing utilities, benchmarking
└── README.md

---

## Setup Instructions

### 1. Flash the Raspberry Pi

Use Raspberry Pi Imager and flash Raspberry Pi OS (64-bit).

Enable:

- SSH
- WiFi (optional)
- Username/password setup

---

### 2. Automated Setup (Recommended)

We provide an automated setup script that handles all installation steps. After flashing your Raspberry Pi and connecting via SSH, run:

```bash
curl -fsSL https://raw.githubusercontent.com/nitrogenlabs/project-echo/main/scripts/setup_project_echo.sh | bash
```

Or download and run it locally:

```bash
wget https://raw.githubusercontent.com/nitrogenlabs/project-echo/main/scripts/setup_project_echo.sh
chmod +x setup_project_echo.sh
./setup_project_echo.sh
```

**What the script does:**

1. Updates apt packages
2. Installs system dependencies (Python 3, pip, venv, git, build-essential, curl)
3. Installs Node.js 24 (via NodeSource)
4. Clones (or updates) the Project Echo repository
5. Creates a Python virtual environment and installs requirements
6. Optionally installs the Akida SDK .whl file (interactive prompt)

After the script completes, you'll be in the `project-echo` directory with the virtual environment ready. The script will provide next steps for running demos and starting the API.

---

### 3. Manual Setup (Alternative)

If you prefer to set up manually or the automated script doesn't work for your environment, follow these steps:

#### 3.1. Install Updates

```bash
sudo apt update && sudo apt upgrade -y
```

#### 3.2. Install Required Dependencies

```bash
sudo apt install python3-pip python3-venv git build-essential -y
```

#### 3.3. Clone the Repository

```bash
git clone https://github.com/nitrogenlabs/project-echo.git
cd project-echo
```

#### 3.4. Set Up the Python Environment

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### 3.5. Install Akida SDK

You may have a .whl file or public BrainChip distribution.

```bash
pip install akida-<version>-linux_aarch64.whl
```

#### 3.6. Verify Hardware Detection

```bash
python scripts/check_akida.py
```

If successful:

```bash
python experiments/demo_inference.py
```

#### 3.7. Run a Sample Model

```bash
python experiments/demo_inference.py
```

---

## Getting Started After Setup

After running the setup script, your system is prepared — but Project Echo has a specific workflow depending on whether you're on **macOS (development mode)** or **Raspberry Pi 5 + Akida (hardware mode)**.

Here is the official next step sequence, tailored to both environments.

---

### 1. Activate Your Python Virtual Environment

From the project root:

```bash
source venv/bin/activate
```

You should see:

```text
(venv) yourname@machine %
```

If you don't see `(venv)`, the environment is **NOT** active.

---

### 2. Verify the Installation

**On Raspberry Pi 5 (Hardware Mode):**

```bash
python scripts/check_akida.py
```

**Expected output:**

```text
Akida device detected on PCIe bus ✔
```

If detection fails, we troubleshoot the hardware connection.

**On macOS (Dev Mode):**

This test will simply return:

```text
Akida not supported on this platform — running in CPU mode.
```

This is normal.

---

### 3. Run a Test Inference

Whether you're on macOS or Pi:

```bash
python experiments/demo_inference.py
```

**On macOS:**

This runs in CPU-only mode.

**On Raspberry Pi:**

This runs on Akida neuromorphic hardware (fast and low power).

If this runs, the core of Project Echo is working.

---

### 4. Start the Echo API (Optional but Recommended)

The Node.js API handles:

- REST endpoints for device, model, and session management
- WebSocket streaming for real-time events
- Device state monitoring
- Structured JSON logging

From the project root:

```bash
cd api
npm install
npm run dev
```

**Expected output:**

```text
Echo API running on http://localhost:4000
```

You can now send requests via:

- Browser
- Postman
- Curl
- Your own client apps

For detailed API documentation, see [api/README.md](api/README.md).

### 5. Start the Echo Dashboard (Optional)

The web dashboard provides a real-time interface for monitoring devices, models, and sessions.

From the project root:

```bash
cd dashboard
npm install
npm run dev
```

**Expected output:**

```text
Dashboard running on http://localhost:5173
```

The dashboard connects to the API automatically and provides:
- Real-time device status monitoring
- Model management interface
- Session and inference event tracking

For detailed dashboard documentation, see [dashboard/README.md](dashboard/README.md).

---

### 6. Train or Convert a Model

Project Echo pipelines expect models to be:

- Quantized
- Compressed
- Converted to `.ez` for Akida inference

From the project root, example:

```bash
python tools/build_model.py --model models/my_model.h5
```

This will generate:

```text
build/my_model.ez
```

---

### 7. Deploy a Model to the Device (Akida only)

If you're on Raspberry Pi:

```bash
python tools/deploy.py --target pi5 --model build/my_model.ez
```

This prepares the model for real-time hardware inference.

---

### 8. Run an Application or Experiment

Echo provides starter experiments in:

```text
experiments/
```

**Examples:**

**Object detection:**

```bash
python experiments/object_detection.py
```

**Audio event recognition:**

```bash
python experiments/audio_classifier.py
```

**Custom pipelines:**

```bash
python experiments/run_pipeline.py
```

---

## Quick Start Flow Summary

**If on macOS:**

1. `source venv/bin/activate`
2. `python experiments/demo_inference.py`
3. `cd api && npm install && npm run dev` (see [api/README.md](api/README.md))
4. `cd dashboard && npm install && npm run dev` (see [dashboard/README.md](dashboard/README.md))
5. Begin developing models or tools

**If on Raspberry Pi:**

1. `source venv/bin/activate`
2. `python scripts/check_akida.py`
3. Run a model demo on Akida
4. Deploy + test real hardware inference

---

## What Comes Next? (Roadmap)

Once the basics are running, the next milestones are:

- **Add camera or microphone inputs** — Real-time inference from sensors
- **Build your first neuromorphic model** — Using the SNN tools provided
- **Create agents / robotics integrations** — Echo was designed to support autonomy and sensor fusion
- **Set up multi-device networking** — Later phases of Echo include networked neuromorphic nodes
- **Extend the dashboard** — Add custom views and monitoring capabilities (see [dashboard/README.md](dashboard/README.md))

---

## Additional Resources

### Documentation

- [API Documentation](api/README.md) - Complete guide to the Echo REST API and WebSocket server
- [Dashboard Documentation](dashboard/README.md) - Guide to the web dashboard interface

### Examples and Templates

We can provide:

- The first real model pipeline to run
- A sample agent AI that uses Echo
- A sensor input example for Pi Camera or USB camera
- A multi-device mesh networking example
- A training notebook for your first SNN model

See the [docs/](docs/) directory or open an issue to request specific examples.

## Contributing

1. Open an issue describing the bug or enhancement.
2. Follow the existing code style.
3. Include documentation updates when needed.
4. Add tests when appropriate.

Pull requests are welcome.

## Roadmap (High-Level)

- Phase 1 — Pi 5 + Akida neuromorphic PoC
- Phase 2 — Echo API with real-time streaming & model management
- Phase 3 — On-device learning modules
- Phase 4 — Multi-device mesh networking
- Phase 5 — Full autonomous agent stack

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

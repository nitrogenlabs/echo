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
├── echo-core/              # Core neuromorphic logic, Akida drivers, pipelines
├── echo-api/               # NodeJS/GraphQL/REST API (optional)
├── echo-tools/             # CLI tools, testing utilities, benchmarking
├── echo-experiments/       # Prototype SNN models, demos, PoC notebooks
├── scripts/                # Deployment & setup scripts
├── docs/                   # Extended documentation
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

### 2. Install Updates

```bash
sudo apt update && sudo apt upgrade -y
```

### 3. Install Required Dependencies

```bash
sudo apt install python3-pip python3-venv git build-essential -y
```

### 4. Clone the Repository

```bash
git clone https://github.com/nitrogenlabs/project-echo.git
cd project-echo
```

### 5. Set Up the Python Environment

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 6. Install Akida SDK

You may have a .whl file or public BrainChip distribution.

```bash
pip install akida-<version>-linux_aarch64.whl
```

### 7. Verify Hardware Detection

```bash
python scripts/check_akida.py
```

If successful:

```bash
python echo-experiments/demo_inference.py
```

### 8. Run a Sample Model

```bash
python echo-experiments/demo_inference.py
```

## Development Workflow

Create Models

Place model files here:

```bash
echo-experiments/models/
```

Build and convert:

```bash
python echo-tools/build_model.py <model_name>
```

## Deploy to Device

```bash
python echo-tools/deploy.py --target pi5 --model build/my_model.ez
```

## Run NodeJS API (Optional)

```bash
cd echo-api
npm install
npm run dev
```

This exposes:

- REST endpoints
- GraphQL API
- WebSocket event stream

## Explore the Documentation

```bash
echo-tools/echo-docs.sh
```

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
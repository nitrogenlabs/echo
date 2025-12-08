#!/usr/bin/env python3
"""
Project Echo – Model Deployment
--------------------------------

Deploys a built model to the runtime directory for use by the inference pipeline.

Usage:
    python tools/deploy.py --model-id my_model --model-path build/my_model.ez --backend akida
"""

import os
import sys
import json
import argparse
import shutil
from pathlib import Path
from datetime import datetime


def load_manifest(manifest_path: str) -> dict:
    """Load the deployment manifest, or return empty dict if it doesn't exist."""
    if os.path.exists(manifest_path):
        with open(manifest_path, "r") as f:
            return json.load(f)
    return {}


def save_manifest(manifest_path: str, manifest: dict):
    """Save the deployment manifest."""
    os.makedirs(os.path.dirname(manifest_path), exist_ok=True)
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)


def deploy_model(
    model_id: str,
    model_path: str,
    backend: str,
    runtime_dir: str
) -> bool:
    """
    Deploy a model to the runtime directory.

    Returns True on success, False on failure.
    """
    print("=" * 50)
    print(" Project Echo – Model Deployment")
    print("=" * 50)
    print()

    # Validate model file exists
    if not os.path.exists(model_path):
        print(f"❌ Model file not found: {model_path}")
        return False

    # Validate backend
    valid_backends = ["akida", "onnx", "tflite", "cpu"]
    if backend not in valid_backends:
        print(f"❌ Invalid backend: {backend}")
        print(f"   Valid backends: {', '.join(valid_backends)}")
        return False

    # Create runtime directory structure
    models_dir = os.path.join(runtime_dir, "models")
    os.makedirs(models_dir, exist_ok=True)

    # Determine model name from path
    model_name = Path(model_path).name

    # Copy model to runtime directory
    dest_path = os.path.join(models_dir, model_name)

    print(f"📦 Deploying model:")
    print(f"   ID: {model_id}")
    print(f"   Source: {model_path}")
    print(f"   Destination: {dest_path}")
    print(f"   Backend: {backend}")
    print()

    try:
        shutil.copy2(model_path, dest_path)
        print(f"✅ Model copied to runtime directory")
    except Exception as e:
        print(f"❌ Failed to copy model: {e}")
        return False

    # Update manifest
    manifest_path = os.path.join(runtime_dir, "manifest.json")
    manifest = load_manifest(manifest_path)

    if "models" not in manifest:
        manifest["models"] = {}

    manifest["models"][model_id] = {
        "id": model_id,
        "name": model_name,
        "backend": backend,
        "path": dest_path,
        "deployedAt": datetime.utcnow().isoformat() + "Z",
    }

    save_manifest(manifest_path, manifest)
    print(f"✅ Manifest updated: {manifest_path}")
    print()
    print(f"🎉 Model '{model_id}' deployed successfully!")
    print(f"   Runtime path: {dest_path}")

    return True


def main():
    parser = argparse.ArgumentParser(
        description="Deploy a model to the runtime directory"
    )
    parser.add_argument(
        "--model-id",
        required=True,
        help="Logical model ID (e.g., 'vision_v1', 'audio_classifier')"
    )
    parser.add_argument(
        "--model-path",
        required=True,
        help="Path to the model file to deploy"
    )
    parser.add_argument(
        "--backend",
        choices=["akida", "onnx", "tflite", "cpu"],
        default="akida",
        help="Backend type (default: akida)"
    )
    parser.add_argument(
        "--runtime-dir",
        default="./runtime",
        help="Runtime directory (default: ./runtime)"
    )

    args = parser.parse_args()

    success = deploy_model(
        args.model_id,
        args.model_path,
        args.backend,
        args.runtime_dir
    )

    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())


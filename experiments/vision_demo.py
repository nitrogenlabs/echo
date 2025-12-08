#!/usr/bin/env python3
"""
Project Echo – Vision Demo Inference
------------------------------------

Demonstrates vision inference using preprocessing and automatic backend selection
(Akida or CPU fallback).

Usage:
    python experiments/vision_demo.py --image path/to/image.jpg
"""

import os
import sys
import argparse
import platform
import numpy as np

# Add parent directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from core.preprocessing import preprocess_image
from core.cpu_fallback import load_cpu_model, check_onnx_available, check_tflite_available


def is_linux_arm():
    """Return True only on Raspberry Pi / Linux ARM64 systems."""
    return platform.system() == "Linux" and (
        "arm" in platform.machine().lower() or "aarch64" in platform.machine().lower()
    )


def attempt_import_akida():
    """Try importing Akida. If unavailable, return (False, None)."""
    try:
        from akida import Model as AkidaModel
        return True, AkidaModel
    except Exception:
        return False, None


def load_akida_model(model_path: str):
    """Load an Akida model."""
    has_akida, AkidaModel = attempt_import_akida()

    if not has_akida:
        raise RuntimeError("Akida SDK not available")

    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Akida model not found: {model_path}")

    print(f"🔌 Loading Akida model from: {model_path}")
    model = AkidaModel(model_path)
    print("✅ Akida model loaded successfully.")
    return model


def run_akida_inference(model, input_array: np.ndarray) -> np.ndarray:
    """Run inference using Akida model."""
    return model.predict(input_array)


def find_cpu_model() -> str:
    """Find a CPU fallback model in the build or runtime directory."""
    # Check common locations
    search_paths = [
        "./build",
        "./runtime/models",
        "../build",
        "../runtime/models",
    ]

    for base_path in search_paths:
        if not os.path.exists(base_path):
            continue

        # Look for ONNX or TFLite models
        for ext in [".onnx", ".tflite"]:
            for file in os.listdir(base_path):
                if file.endswith(ext):
                    return os.path.join(base_path, file)

    return None


def main():
    parser = argparse.ArgumentParser(
        description="Run vision inference demo"
    )
    parser.add_argument(
        "--image", "-i",
        required=True,
        help="Path to input image file"
    )
    parser.add_argument(
        "--model",
        help="Path to model file (auto-detected if not provided)"
    )
    parser.add_argument(
        "--target-shape",
        nargs=2,
        type=int,
        default=[224, 224],
        metavar=("HEIGHT", "WIDTH"),
        help="Target image shape (default: 224 224)"
    )
    parser.add_argument(
        "--grayscale",
        action="store_true",
        help="Convert image to grayscale"
    )

    args = parser.parse_args()

    print("=" * 50)
    print(" Project Echo – Vision Demo Inference")
    print("=" * 50)
    print()

    # Validate image file
    if not os.path.exists(args.image):
        print(f"❌ Image file not found: {args.image}")
        return 1

    # Detect platform and hardware
    has_akida = False
    AkidaModel = None

    if is_linux_arm():
        print("🔍 Checking for Akida SDK and hardware...")
        has_akida, AkidaModel = attempt_import_akida()

    # Determine model path and backend
    model_path = args.model
    backend = None
    model = None

    if has_akida and not model_path:
        # Try to find Akida model
        akida_paths = [
            "./build/demo_model.ez",
            "./runtime/models/demo_model.ez",
            "../build/demo_model.ez",
        ]
        for path in akida_paths:
            if os.path.exists(path):
                model_path = path
                backend = "akida"
                break

    if not model_path:
        # Try to find CPU model
        model_path = find_cpu_model()
        if model_path:
            if model_path.endswith(".onnx"):
                backend = "onnx"
            elif model_path.endswith(".tflite"):
                backend = "tflite"

    if not model_path:
        print("⚠️  No model found. Using dummy inference.")
        backend = "dummy"
    else:
        print(f"📦 Using model: {model_path}")
        print(f"   Backend: {backend}")
        print()

    # Load model
    if backend == "akida":
        try:
            model = load_akida_model(model_path)
        except Exception as e:
            print(f"❌ Failed to load Akida model: {e}")
            print("   Falling back to CPU mode...")
            backend = "cpu"
            model = None

    if backend in ["onnx", "tflite"]:
        try:
            model = load_cpu_model(model_path, preferred_backend=backend)
        except Exception as e:
            print(f"❌ Failed to load CPU model: {e}")
            print("   Using dummy inference...")
            backend = "dummy"
            model = None

    # Preprocess image
    print(f"🖼️  Preprocessing image: {args.image}")
    try:
        input_array = preprocess_image(
            args.image,
            target_shape=tuple(args.target_shape),
            grayscale=args.grayscale
        )
        print(f"✅ Image preprocessed. Shape: {input_array.shape}")
    except Exception as e:
        print(f"❌ Failed to preprocess image: {e}")
        return 1

    print()
    print("🔄 Running inference...")

    # Run inference
    try:
        if backend == "akida":
            output = run_akida_inference(model, input_array)
        elif backend in ["onnx", "tflite"]:
            from core.cpu_fallback import run_cpu_inference
            output = run_cpu_inference(model, input_array)
        else:
            # Dummy inference
            output = np.random.rand(10)  # Placeholder output

        print("✅ Inference completed.")
        print()
        print("📤 Model output:")
        print(f"   Shape: {output.shape}")
        print(f"   Values: {output}")
        print()

        # TODO: Map output to class labels
        # For now, just show top predictions
        if len(output.shape) == 1 and len(output) > 0:
            top_indices = np.argsort(output)[::-1][:5]
            print("🔝 Top 5 predictions (placeholder):")
            for i, idx in enumerate(top_indices):
                print(f"   {i+1}. Class {idx}: {output[idx]:.4f}")

    except Exception as e:
        print(f"❌ Inference failed: {e}")
        import traceback
        traceback.print_exc()
        return 1

    print("🎉 Vision demo completed successfully!")
    return 0


if __name__ == "__main__":
    sys.exit(main())


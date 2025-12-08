#!/usr/bin/env python3
"""
Project Echo – Model Builder
----------------------------

Builds and compiles models for Akida inference or CPU fallback.

Usage:
    python tools/build_model.py --model path/to/model.h5 --backend akida
    python tools/build_model.py --model path/to/model.onnx --backend onnx
"""

import os
import sys
import argparse
import platform
from pathlib import Path


def is_linux_arm():
    """Return True only on Raspberry Pi / Linux ARM64 systems."""
    return platform.system() == "Linux" and (
        "arm" in platform.machine().lower() or "aarch64" in platform.machine().lower()
    )


def attempt_import_akida():
    """Try importing Akida. If unavailable, return (False, None)."""
    try:
        from akida import Model as AkidaModel
        from akida_models import akida_models
        return True, AkidaModel, akida_models
    except Exception:
        return False, None, None


def validate_source_model(model_path: str) -> bool:
    """Validate that the source model file exists."""
    if not os.path.exists(model_path):
        print(f"❌ Source model not found: {model_path}")
        return False

    ext = Path(model_path).suffix.lower()
    supported = [".h5", ".keras", ".onnx", ".tflite", ".pb"]

    if ext not in supported:
        print(f"⚠️  Warning: Unsupported file extension: {ext}")
        print(f"   Supported: {', '.join(supported)}")

    return True


def build_akida_model(model_path: str, output_dir: str) -> str:
    """
    Build an Akida model from a source model.

    Returns the path to the compiled .ez file.
    """
    has_akida, AkidaModel, akida_models = attempt_import_akida()

    if not has_akida:
        raise RuntimeError(
            "Akida SDK not available. Cannot build Akida models on this platform."
        )

    print(f"🔌 Building Akida model from: {model_path}")

    # Determine input format
    ext = Path(model_path).suffix.lower()
    model_name = Path(model_path).stem

    # For now, we'll use a placeholder conversion
    # TODO: Implement actual Keras/ONNX to Akida conversion
    # This typically involves:
    # 1. Load source model (Keras/TensorFlow)
    # 2. Quantize model
    # 3. Convert to Akida format
    # 4. Compile to .ez file

    if ext in [".h5", ".keras"]:
        print("📦 Loading Keras model...")
        # TODO: Load with TensorFlow/Keras and convert
        print("⚠️  Keras to Akida conversion not yet implemented.")
        print("    Placeholder: creating dummy .ez file")
    elif ext == ".onnx":
        print("📦 Loading ONNX model...")
        # TODO: ONNX to Akida conversion
        print("⚠️  ONNX to Akida conversion not yet implemented.")
        print("    Placeholder: creating dummy .ez file")
    else:
        raise ValueError(f"Unsupported source format for Akida: {ext}")

    # Create output directory
    os.makedirs(output_dir, exist_ok=True)

    # Placeholder output file
    output_path = os.path.join(output_dir, f"{model_name}.ez")

    # TODO: Replace with actual Akida compilation
    # For now, create an empty file as placeholder
    with open(output_path, "wb") as f:
        f.write(b"# Placeholder Akida model file\n")

    print(f"✅ Akida model compiled: {output_path}")
    return output_path


def export_onnx_fallback(model_path: str, output_dir: str) -> str:
    """
    Export model to ONNX format for CPU fallback.

    Returns the path to the .onnx file.
    """
    print(f"📦 Exporting ONNX fallback model from: {model_path}")

    ext = Path(model_path).suffix.lower()
    model_name = Path(model_path).stem

    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, f"{model_name}_cpu.onnx")

    if ext in [".h5", ".keras"]:
        # TODO: Convert Keras to ONNX using tf2onnx or keras2onnx
        print("⚠️  Keras to ONNX conversion not yet implemented.")
        print("    Placeholder: creating dummy .onnx file")
        with open(output_path, "wb") as f:
            f.write(b"# Placeholder ONNX model file\n")
    elif ext == ".onnx":
        # Already ONNX, just copy
        import shutil
        shutil.copy2(model_path, output_path)
        print(f"✅ ONNX model copied: {output_path}")
    else:
        raise ValueError(f"Cannot convert {ext} to ONNX")

    return output_path


def export_tflite_fallback(model_path: str, output_dir: str) -> str:
    """
    Export model to TensorFlow Lite format for CPU fallback.

    Returns the path to the .tflite file.
    """
    print(f"📦 Exporting TFLite fallback model from: {model_path}")

    ext = Path(model_path).suffix.lower()
    model_name = Path(model_path).stem

    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, f"{model_name}_cpu.tflite")

    if ext in [".h5", ".keras"]:
        # TODO: Convert Keras to TFLite
        print("⚠️  Keras to TFLite conversion not yet implemented.")
        print("    Placeholder: creating dummy .tflite file")
        with open(output_path, "wb") as f:
            f.write(b"# Placeholder TFLite model file\n")
    elif ext == ".tflite":
        # Already TFLite, just copy
        import shutil
        shutil.copy2(model_path, output_path)
        print(f"✅ TFLite model copied: {output_path}")
    else:
        raise ValueError(f"Cannot convert {ext} to TFLite")

    return output_path


def main():
    parser = argparse.ArgumentParser(
        description="Build models for Akida or CPU fallback"
    )
    parser.add_argument(
        "--model", "-m",
        required=True,
        help="Path to source model file (.h5, .keras, .onnx, etc.)"
    )
    parser.add_argument(
        "--backend",
        choices=["akida", "onnx", "tflite"],
        default="akida",
        help="Target backend (default: akida)"
    )
    parser.add_argument(
        "--output-dir", "-o",
        default="./build",
        help="Output directory (default: ./build)"
    )

    args = parser.parse_args()

    print("=" * 50)
    print(" Project Echo – Model Builder")
    print("=" * 50)
    print()

    # Validate source model
    if not validate_source_model(args.model):
        return 1

    # Build based on backend
    try:
        if args.backend == "akida":
            if not is_linux_arm():
                print("⚠️  Akida backend requires Linux ARM platform.")
                print("    Falling back to validation only.")
                print("    Use --backend onnx or --backend tflite for CPU fallback.")
                return 0

            output_path = build_akida_model(args.model, args.output_dir)
            print(f"\n✅ Build complete: {output_path}")

        elif args.backend == "onnx":
            output_path = export_onnx_fallback(args.model, args.output_dir)
            print(f"\n✅ Build complete: {output_path}")

        elif args.backend == "tflite":
            output_path = export_tflite_fallback(args.model, args.output_dir)
            print(f"\n✅ Build complete: {output_path}")

        return 0

    except Exception as e:
        print(f"\n❌ Build failed: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())


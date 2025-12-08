#!/usr/bin/env python3
"""
Project Echo – Demo Inference Stub
----------------------------------

This script demonstrates how to:

1. Detect whether Akida hardware is available.
2. Load a model (CPU fallback OR Akida model).
3. Run a simple inference pass with sample data.
4. Output diagnostics for development/testing.

This file is intentionally simple and acts as a starting point for
experiments, benchmarking, and pipeline development.

Replace the "sample_input" and "model_path" sections with real data and
real models as needed.
"""

import os
import sys
import platform
import numpy as np
import textwrap


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
    except Exception as e:
        print("⚠️  Akida SDK not available. Falling back to CPU mode.")
        print("    Details:", repr(e))
        print()
        return False, None


def load_cpu_model():
    """
    Placeholder CPU model.
    Replace with a real CPU-based fallback (e.g., TensorFlow Lite or ONNX Runtime)
    if you want real CPU inference.
    """
    class DummyCPUModel:
        def predict(self, x):
            # Fake output: returns random vector of shape (10,)
            return np.random.rand(10)

    print("🧠 Using Dummy CPU Model (placeholder)")
    return DummyCPUModel()


def load_akida_model(AkidaModel, model_path):
    """
    Load a compiled Akida model (.ez file).
    """
    try:
        print(f"🔌 Loading Akida model from: {model_path}")
        model = AkidaModel(model_path)
        print("✅ Akida model loaded successfully.")
        return model
    except Exception as e:
        print("❌ Error loading Akida model.")
        print("Details:", repr(e))
        sys.exit(1)


def main():
    print("=" * 50)
    print(" Project Echo – Demo Inference")
    print("=" * 50)
    print()

    # -------------------------------
    # Detect platform + hardware mode
    # -------------------------------
    print(f"Platform       : {platform.system()}")
    print(f"Architecture   : {platform.machine()}")
    print()

    has_akida = False
    AkidaModel = None

    if is_linux_arm():
        print("🔍 Checking for Akida SDK and hardware...")
        has_akida, AkidaModel = attempt_import_akida()
    else:
        print("ℹ Running on non-Akida platform (macOS/PC). CPU-only mode enabled.")
        print()

    # -------------------------------
    # Choose model based on hardware
    # -------------------------------
    if has_akida:
        # Update this path to wherever your model lives
        model_path = os.path.join("build", "demo_model.ez")

        if not os.path.exists(model_path):
            print(
                textwrap.dedent(
                    f"""
                    ❌ Akida model file not found:

                        {model_path}

                    Please build a model first using:

                        python tools/build_model.py --model <your_model.h5>

                    Then re-run this script.
                    """
                )
            )
            sys.exit(1)

        model = load_akida_model(AkidaModel, model_path)
        mode = "akida"

    else:
        model = load_cpu_model()
        mode = "cpu"

    print(f"🚀 Running demo inference in **{mode.upper()} mode**")
    print()

    # -------------------------------
    # Prepare sample input
    # -------------------------------
    # Replace with real preprocessed input for your model.
    sample_input = np.random.rand(1, 128).astype(np.float32)
    print("📦 Sample input shape:", sample_input.shape)

    # -------------------------------
    # Perform inference
    # -------------------------------
    print("🔄 Running inference...")

    try:
        if mode == "akida":
            # Akida Model.predict() generally returns spike events or probability vectors
            output = model.predict(sample_input)
        else:
            # Dummy CPU model
            output = model.predict(sample_input)

        print("✅ Inference completed.")
        print("📤 Model output:", output)
        print()

    except Exception as e:
        print("❌ Inference failed.")
        print("Details:", repr(e))
        sys.exit(1)

    print("🎉 Demo inference finished successfully.")
    print("You can modify this script to build more advanced pipelines!")


if __name__ == "__main__":
    sys.exit(main())
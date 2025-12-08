"""
Project Echo – CPU Fallback Inference
--------------------------------------

Provides a unified interface for CPU-based inference using ONNX Runtime
or TensorFlow Lite as fallback when Akida hardware is not available.
"""

import os
import sys
from typing import Union, Optional
import numpy as np


class CpuModel:
    """Abstraction for CPU-based inference models."""

    def __init__(self, backend: str, model_obj):
        self.backend = backend
        self._model = model_obj

    def predict(self, input_array: np.ndarray) -> np.ndarray:
        """
        Run inference on the input array.

        Args:
            input_array: Input data as numpy array

        Returns:
            Output predictions as numpy array
        """
        if self.backend == "onnx":
            return self._predict_onnx(input_array)
        elif self.backend == "tflite":
            return self._predict_tflite(input_array)
        else:
            raise ValueError(f"Unsupported backend: {self.backend}")

    def _predict_onnx(self, input_array: np.ndarray) -> np.ndarray:
        """Run ONNX Runtime inference."""
        import onnxruntime as ort

        # Get input name from model
        input_name = self._model.get_inputs()[0].name

        # Run inference
        outputs = self._model.run(None, {input_name: input_array})

        # Return first output
        return outputs[0] if outputs else np.array([])

    def _predict_tflite(self, input_array: np.ndarray) -> np.ndarray:
        """Run TensorFlow Lite inference."""
        # Get input and output details
        input_details = self._model.get_input_details()
        output_details = self._model.get_output_details()

        # Set input tensor
        self._model.set_tensor(input_details[0]["index"], input_array)

        # Run inference
        self._model.invoke()

        # Get output
        output_data = self._model.get_tensor(output_details[0]["index"])
        return output_data


def check_onnx_available() -> bool:
    """Check if ONNX Runtime is installed."""
    try:
        import onnxruntime
        return True
    except ImportError:
        return False


def check_tflite_available() -> bool:
    """Check if TensorFlow Lite is available."""
    try:
        import tflite_runtime.interpreter as tflite
        return True
    except ImportError:
        try:
            import tensorflow as tf
            return hasattr(tf, "lite")
        except ImportError:
            return False


def load_cpu_model(path: str, preferred_backend: Optional[str] = None) -> CpuModel:
    """
    Load a CPU model from file, preferring ONNX Runtime if available.

    Args:
        path: Path to model file (.onnx or .tflite)
        preferred_backend: "onnx" or "tflite" to force a specific backend

    Returns:
        CpuModel instance

    Raises:
        RuntimeError: If no suitable backend is available or model cannot be loaded
    """
    ext = os.path.splitext(path)[1].lower()

    # Determine backend
    if preferred_backend:
        backend = preferred_backend
    elif ext == ".onnx":
        backend = "onnx"
    elif ext in [".tflite", ".lite"]:
        backend = "tflite"
    else:
        # Try to auto-detect based on available libraries
        if check_onnx_available():
            backend = "onnx"
        elif check_tflite_available():
            backend = "tflite"
        else:
            raise RuntimeError(
                "No CPU inference backend available. "
                "Install ONNX Runtime: pip install onnxruntime\n"
                "Or TensorFlow Lite: pip install tflite-runtime"
            )

    # Load model based on backend
    if backend == "onnx":
        if not check_onnx_available():
            raise RuntimeError(
                "ONNX Runtime not available. Install with: pip install onnxruntime"
            )

        import onnxruntime as ort

        try:
            session = ort.InferenceSession(path)
            return CpuModel("onnx", session)
        except Exception as e:
            raise RuntimeError(f"Failed to load ONNX model: {e}")

    elif backend == "tflite":
        if not check_tflite_available():
            raise RuntimeError(
                "TensorFlow Lite not available. Install with: "
                "pip install tflite-runtime (or tensorflow)"
            )

        try:
            # Try tflite_runtime first (lighter weight)
            try:
                import tflite_runtime.interpreter as tflite
                interpreter = tflite.Interpreter(model_path=path)
            except ImportError:
                # Fall back to full TensorFlow
                import tensorflow as tf
                interpreter = tf.lite.Interpreter(model_path=path)

            interpreter.allocate_tensors()
            return CpuModel("tflite", interpreter)
        except Exception as e:
            raise RuntimeError(f"Failed to load TFLite model: {e}")

    else:
        raise ValueError(f"Unsupported backend: {backend}")


def run_cpu_inference(model: CpuModel, input_array: np.ndarray) -> np.ndarray:
    """
    Run inference using a CPU model.

    Args:
        model: CpuModel instance
        input_array: Input data as numpy array

    Returns:
        Output predictions as numpy array
    """
    return model.predict(input_array)


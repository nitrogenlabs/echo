"""
Project Echo – Preprocessing Pipelines
---------------------------------------

Provides preprocessing functions for vision and audio inputs,
compatible with both Akida and CPU fallback backends.
"""

import os
import numpy as np
from typing import Tuple, Optional


def preprocess_image(
    path: str,
    target_shape: Tuple[int, int] = (224, 224),
    grayscale: bool = False,
    normalize: bool = True
) -> np.ndarray:
    """
    Preprocess an image file for inference.

    Args:
        path: Path to image file
        target_shape: Target (height, width) for resizing
        grayscale: Convert to grayscale if True
        normalize: Normalize to [0, 1] range if True

    Returns:
        Preprocessed image as numpy array with shape (1, H, W, C) or (1, H, W)
    """
    # Try PIL first (lighter weight), fall back to OpenCV
    try:
        from PIL import Image
        img = Image.open(path)

        # Convert to RGB if needed
        if img.mode != "RGB" and not grayscale:
            img = img.convert("RGB")
        elif grayscale and img.mode != "L":
            img = img.convert("L")

        # Resize
        img = img.resize(target_shape, Image.Resampling.LANCZOS)

        # Convert to numpy array
        img_array = np.array(img, dtype=np.float32)

    except ImportError:
        # Fall back to OpenCV if PIL not available
        try:
            import cv2
            img = cv2.imread(path)

            if img is None:
                raise ValueError(f"Could not load image: {path}")

            # Convert BGR to RGB (OpenCV uses BGR)
            if not grayscale:
                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            else:
                img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

            # Resize
            img = cv2.resize(img, target_shape, interpolation=cv2.INTER_LINEAR)
            img_array = img.astype(np.float32)

        except ImportError:
            raise RuntimeError(
                "No image library available. Install PIL: pip install Pillow\n"
                "Or OpenCV: pip install opencv-python"
            )

    # Normalize to [0, 1] range
    if normalize:
        img_array = img_array / 255.0

    # Add batch dimension
    if len(img_array.shape) == 2:  # Grayscale
        img_array = np.expand_dims(img_array, axis=0)  # Add channel dimension
        img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
    else:  # RGB
        img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension

    return img_array


def preprocess_audio(
    path: str,
    sample_rate: int = 16000,
    duration: Optional[float] = None,
    normalize: bool = True
) -> np.ndarray:
    """
    Preprocess an audio file for inference.

    Args:
        path: Path to audio file (WAV, MP3, etc.)
        sample_rate: Target sample rate (default: 16000)
        duration: Optional duration to trim/pad to (in seconds)
        normalize: Normalize audio to [-1, 1] range if True

    Returns:
        Preprocessed audio as numpy array with shape (1, samples) or (1, features)
    """
    # Try librosa first (better for audio processing)
    try:
        import librosa

        # Load audio file
        audio, sr = librosa.load(path, sr=sample_rate, mono=True)

        # Trim or pad to duration if specified
        if duration is not None:
            target_samples = int(duration * sample_rate)
            if len(audio) > target_samples:
                audio = audio[:target_samples]
            elif len(audio) < target_samples:
                audio = np.pad(audio, (0, target_samples - len(audio)), mode="constant")

        # Normalize to [-1, 1] range
        if normalize:
            max_val = np.max(np.abs(audio))
            if max_val > 0:
                audio = audio / max_val

        # Add batch dimension
        audio = np.expand_dims(audio, axis=0)

        return audio.astype(np.float32)

    except ImportError:
        # Fall back to scipy.io.wavfile or wave module
        try:
            from scipy.io import wavfile

            sr, audio = wavfile.read(path)

            # Convert to mono if stereo
            if len(audio.shape) > 1:
                audio = np.mean(audio, axis=1)

            # Resample if needed (simple linear interpolation)
            if sr != sample_rate:
                from scipy import signal
                num_samples = int(len(audio) * sample_rate / sr)
                audio = signal.resample(audio, num_samples)

            # Convert to float32
            if audio.dtype == np.int16:
                audio = audio.astype(np.float32) / 32768.0
            elif audio.dtype == np.int32:
                audio = audio.astype(np.float32) / 2147483648.0

            # Trim or pad to duration if specified
            if duration is not None:
                target_samples = int(duration * sample_rate)
                if len(audio) > target_samples:
                    audio = audio[:target_samples]
                elif len(audio) < target_samples:
                    audio = np.pad(audio, (0, target_samples - len(audio)), mode="constant")

            # Normalize to [-1, 1] range
            if normalize:
                max_val = np.max(np.abs(audio))
                if max_val > 0:
                    audio = audio / max_val

            # Add batch dimension
            audio = np.expand_dims(audio, axis=0)

            return audio.astype(np.float32)

        except ImportError:
            raise RuntimeError(
                "No audio library available. Install librosa: pip install librosa\n"
                "Or scipy: pip install scipy"
            )


def audio_to_spectrogram(
    audio: np.ndarray,
    n_fft: int = 2048,
    hop_length: int = 512,
    n_mels: Optional[int] = None
) -> np.ndarray:
    """
    Convert audio array to spectrogram.

    Args:
        audio: Audio array with shape (batch, samples) or (samples,)
        n_fft: FFT window size
        hop_length: Hop length for STFT
        n_mels: Number of mel bands (if None, returns linear spectrogram)

    Returns:
        Spectrogram with shape (batch, freq_bins, time_frames) or (freq_bins, time_frames)
    """
    try:
        import librosa

        # Remove batch dimension if present
        if len(audio.shape) > 1:
            audio = audio[0]

        # Compute STFT
        stft = librosa.stft(audio, n_fft=n_fft, hop_length=hop_length)

        # Convert to magnitude spectrogram
        spectrogram = np.abs(stft)

        # Convert to mel spectrogram if requested
        if n_mels is not None:
            spectrogram = librosa.feature.melspectrogram(
                S=spectrogram,
                n_mels=n_mels,
                fmax=8000  # Adjust as needed
            )

        # Add batch dimension
        spectrogram = np.expand_dims(spectrogram, axis=0)

        return spectrogram.astype(np.float32)

    except ImportError:
        raise RuntimeError(
            "librosa required for spectrogram conversion. Install: pip install librosa"
        )


def audio_to_mfcc(
    audio: np.ndarray,
    n_mfcc: int = 13,
    sample_rate: int = 16000
) -> np.ndarray:
    """
    Convert audio array to MFCC features.

    Args:
        audio: Audio array with shape (batch, samples) or (samples,)
        n_mfcc: Number of MFCC coefficients
        sample_rate: Sample rate of the audio

    Returns:
        MFCC features with shape (batch, n_mfcc, time_frames) or (n_mfcc, time_frames)
    """
    try:
        import librosa

        # Remove batch dimension if present
        if len(audio.shape) > 1:
            audio = audio[0]

        # Compute MFCC
        mfcc = librosa.feature.mfcc(
            y=audio,
            sr=sample_rate,
            n_mfcc=n_mfcc
        )

        # Add batch dimension
        mfcc = np.expand_dims(mfcc, axis=0)

        return mfcc.astype(np.float32)

    except ImportError:
        raise RuntimeError(
            "librosa required for MFCC extraction. Install: pip install librosa"
        )


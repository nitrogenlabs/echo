#!/usr/bin/env python3
"""
Project Echo – Akida Hardware Check

This script verifies that:

1. The Akida Python SDK is installed.
2. The current platform is capable of using Akida hardware.
3. At least one Akida device is detected on the PCIe bus (on supported platforms).

It is designed to behave gracefully on macOS and non-Akida platforms, where it
will simply report that Akida hardware is not available and that CPU-only
mode should be used instead.
"""

import sys
import platform
import textwrap


def print_header():
    print("=" * 50)
    print(" Project Echo – Akida Hardware Diagnostic")
    print("=" * 50)
    print()


def is_linux_arm():
    system = platform.system()
    machine = platform.machine().lower()
    return system == "Linux" and ("arm" in machine or "aarch64" in machine)


def check_akida_import():
    try:
        # This import path is based on the standard BrainChip Akida SDK.
        # If your SDK uses a different module name, update here.
        from akida import devices  # noqa: F401
        return True
    except ImportError as e:
        print("❌ Akida SDK not found (ImportError).")
        print()
        print("Details:", e)
        print()
        print(
            textwrap.dedent(
                """\
                To install the Akida SDK, activate your virtual environment and run:

                    pip install /path/to/akida-<version>-linux_aarch64.whl

                (Use the wheel file provided by BrainChip for Raspberry Pi / ARM64.)
                """
            )
        )
        return False
    except Exception as e:
        print("❌ Unexpected error while importing Akida SDK.")
        print("Details:", repr(e))
        return False


def list_akida_devices():
    """
    Attempt to list attached Akida devices using the SDK.

    Depending on your SDK version, you may need to adjust the import/usage here.
    """
    try:
        from akida import devices

        devs = devices()
        if not devs:
            print("❌ Akida SDK is installed, but no devices were detected.")
            print(
                textwrap.dedent(
                    """\
                    Possible causes:
                      - The Akida M.2 card is not seated correctly.
                      - The M.2 adapter is not connected to the Pi 5 PCIe slot.
                      - Required kernel/PCIe settings are not enabled.
                    """
                )
            )
            return False

        print("✅ Akida SDK is installed.")
        print(f"✅ {len(devs)} Akida device(s) detected on PCIe bus:")
        for idx, dev in enumerate(devs):
            # The exact attributes may vary by SDK version; adjust as needed.
            desc = getattr(dev, "description", None)
            name = getattr(dev, "name", None)
            ident = desc or name or str(dev)
            print(f"   • Device {idx + 1}: {ident}")
        print()
        print("Akida device detected on PCIe bus ✔")
        return True

    except ImportError:
        # This should be caught earlier, but we handle it defensively.
        print("❌ Akida SDK could not be imported while listing devices.")
        return False
    except Exception as e:
        print("❌ Error while querying Akida devices.")
        print("Details:", repr(e))
        return False


def main():
    print_header()

    system = platform.system()
    machine = platform.machine()
    print(f"Detected platform : {system}")
    print(f"Architecture      : {machine}")
    print()

    # 1. Check whether we are on a platform that *can* use Akida hardware
    if not is_linux_arm():
        print(
            textwrap.dedent(
                """\
                ℹ Akida hardware is only supported on Linux ARM platforms
                  (e.g., Raspberry Pi 5 with the Akida M.2 card attached).

                This machine is not a supported hardware target. You can still:
                  • Use CPU-only mode for development and testing.
                  • Run Project Echo experiments and the API locally.
                """
            )
        )
        # Exit 0 because this is not an error for dev environments.
        return 0

    # 2. On Linux ARM, ensure Akida SDK is installed
    if not check_akida_import():
        # Missing SDK is considered a non-zero exit (action required).
        return 1

    # 3. Try to detect devices
    ok = list_akida_devices()
    return 0 if ok else 2


if __name__ == "__main__":
    sys.exit(main())
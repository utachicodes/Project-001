# -*- coding: utf-8 -*-
"""
Mafalia Code -- Launcher
=========================
Starts both the Python bridge API and the Electron app.
"""

import subprocess
import sys
import os
import time
import signal
from pathlib import Path

# Get paths
ROOT = Path(__file__).parent
MAFALIA_CODE_DIR = ROOT / "mafalia_code"

def start_python_bridge():
    """Start the Python FastAPI bridge API."""
    print("[1/2] Starting Python bridge API on port 9777...")
    env = os.environ.copy()
    env["MAFALIA_DATA_DIR"] = str(ROOT)
    
    proc = subprocess.Popen(
        [sys.executable, "mafalia_code/bridge_api.py"],
        cwd=ROOT,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    
    # Wait a moment for it to start
    time.sleep(2)
    
    # Check if it's running``
    if proc.poll() is None:
        print("✓ Python bridge API started successfully")
        return proc
    else:
        stdout, stderr = proc.communicate()
        print(f"✗ Python bridge failed to start:\n{stderr.decode()}")
        return None

def start_electron():
    """Start the Electron app."""
    print("[2/2] Starting Mafalia Code Electron app...")
    
    # Check if node_modules exists
    if not (MAFALIA_CODE_DIR / "node_modules").exists():
        print("✗ Node modules not found. Run: cd mafalia_code && npm install")
        return None
    
    proc = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=MAFALIA_CODE_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    
    print("✓ Electron app starting...")
    return proc

def main():
    print("=" * 60)
    print("  MAFALIA CODE - Business Operations CoWork")
    print("=" * 60)
    print()
    
    # Start Python bridge
    python_proc = start_python_bridge()
    if not python_proc:
        print("\nFailed to start Python bridge. Exiting.")
        sys.exit(1)
    
    # Start Electron
    electron_proc = start_electron()
    if not electron_proc:
        python_proc.terminate()
        print("\nFailed to start Electron. Exiting.")
        sys.exit(1)
    
    print()
    print("-" * 60)
    print("  Both services running!")
    print("  • Python API: http://127.0.0.1:9777")
    print("  • Electron app: Opening window...")
    print("-" * 60)
    print()
    print("Press Ctrl+C to stop both services")
    print()
    
    # Handle shutdown
    def shutdown(signum, frame):
        print("\n\nShutting down...")
        electron_proc.terminate()
        python_proc.terminate()
        sys.exit(0)
    
    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)
    
    # Wait for processes
    try:
        while True:
            # Check if either process died
            python_status = python_proc.poll()
            electron_status = electron_proc.poll()
            
            if python_status is not None:
                print(f"\nPython bridge exited with code {python_status}")
                electron_proc.terminate()
                break
                
            if electron_status is not None:
                print(f"\nElectron exited with code {electron_status}")
                python_proc.terminate()
                break
                
            time.sleep(1)
    except KeyboardInterrupt:
        shutdown(None, None)

if __name__ == "__main__":
    main()

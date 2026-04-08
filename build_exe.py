# -*- coding: utf-8 -*-
"""
Mafalia Code -- Build Standalone .exe
========================================
Run: python build_exe.py

This creates a standalone MafaliaCode.exe in the dist/ folder.
Requirements: pip install pyinstaller customtkinter
"""

import os
import sys
import subprocess

ROOT = os.path.dirname(os.path.abspath(__file__))


def build():
    # Find customtkinter location for bundling
    try:
        import customtkinter
        ctk_path = os.path.dirname(customtkinter.__file__)
    except ImportError:
        print("ERROR: customtkinter not installed. Run: pip install customtkinter")
        sys.exit(1)

    cmd = [
        sys.executable, "-m", "PyInstaller",
        "--noconfirm",
        "--onedir",
        "--windowed",
        "--name", "MafaliaCode",
        # Include all Mafalia packages
        "--add-data", f"{os.path.join(ROOT, 'mafalia_agents')};mafalia_agents",
        "--add-data", f"{os.path.join(ROOT, 'mafalia_api')};mafalia_api",
        "--add-data", f"{os.path.join(ROOT, 'mafalia_cli')};mafalia_cli",
        "--add-data", f"{os.path.join(ROOT, 'mafalia_mcp')};mafalia_mcp",
        "--add-data", f"{os.path.join(ROOT, 'mafalia_knowledge')};mafalia_knowledge",
        "--add-data", f"{os.path.join(ROOT, 'mafalia_code')};mafalia_code",
        "--add-data", f"{os.path.join(ROOT, 'dashboard')};dashboard",
        # Include CSV data files
        "--add-data", f"{os.path.join(ROOT, '*.csv')};.",
        # Include customtkinter theme files
        "--add-data", f"{ctk_path};customtkinter",
        # Hidden imports
        "--hidden-import", "customtkinter",
        "--hidden-import", "mafalia_agents",
        "--hidden-import", "mafalia_agents.agents",
        "--hidden-import", "mafalia_agents.orchestrator",
        "--hidden-import", "mafalia_agents.skills",
        "--hidden-import", "mafalia_agents.prompts",
        "--hidden-import", "mafalia_knowledge",
        "--hidden-import", "mafalia_knowledge.knowledge_base",
        "--hidden-import", "mafalia_knowledge.memory",
        "--hidden-import", "pandas",
        "--hidden-import", "numpy",
        "--hidden-import", "httpx",
        # Entry point
        os.path.join(ROOT, "run_mafalia_code.py"),
    ]

    print("Building MafaliaCode.exe ...")
    print(f"Command: {' '.join(cmd[:10])} ...")
    result = subprocess.run(cmd, cwd=ROOT)
    if result.returncode == 0:
        print()
        print("=" * 50)
        print("  BUILD SUCCESSFUL")
        print(f"  Output: {os.path.join(ROOT, 'dist', 'MafaliaCode')}")
        print("=" * 50)
    else:
        print("BUILD FAILED")
        sys.exit(1)


if __name__ == "__main__":
    build()

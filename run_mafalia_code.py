# -*- coding: utf-8 -*-
"""
Mafalia Code -- Desktop App Launcher
=======================================
Double-click this file or run: python run_mafalia_code.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    from mafalia_code.app import main
    main()

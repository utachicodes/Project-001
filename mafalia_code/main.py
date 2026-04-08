# -*- coding: utf-8 -*-
"""
Mafalia Code -- Entry Point
==============================
Launch the desktop application.
Run: python -m mafalia_code.main
"""

import os
import sys

# Ensure project root is on path for agent imports
_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)

from mafalia_code.app import main

if __name__ == "__main__":
    main()

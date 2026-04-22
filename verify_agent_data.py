import os
import sys
import pandas as pd
from mafalia_agents.agents import ALL_AGENTS, get_agent

def verify_data_access():
    print("=== MAFALIA AGENT DATA VERIFICATION ===")
    data_dir = "."

    # Check if CSV files exist
    required_files = [
        "transactions_rows.csv",
        "produits_rows.csv",
        "clients_rows.csv",
        "commandes_rows.csv",
        "entrees_stock_rows.csv"
    ]

    print("\n1. Checking CSV files:")
    for f in required_files:
        exists = os.path.exists(os.path.join(data_dir, f))
        status = "OK" if exists else "MISSING"
        size = os.path.getsize(f) if exists else 0
        print(f"  - {f:25}: {status} ({size} bytes)")

    print("\n2. Initializing all agents and testing logic:")
    for name in ALL_AGENTS.keys():
        try:
            agent = get_agent(name, data_dir)
            print(f"  [+] {name.upper():7} - Profile: {agent.profile.title}")

            # Simple process call to trigger data loading and basic logic
            # Use 'revenue' as it's a common trigger for many agents or handled by default
            result = agent.process("status check")

            if "error" in result:
                print(f"      [!] Process returned error: {result['error']}")
            else:
                keys = list(result.keys())[:3]
                print(f"      [✓] Success. Returned keys: {keys}")

        except Exception as e:
            print(f"  [X] {name.upper():7} - FAILED: {str(e)}")

    print("\nVerification Complete.")

if __name__ == "__main__":
    verify_data_access()

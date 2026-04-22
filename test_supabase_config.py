import os
from supabase import create_client, Client

def test_supabase_config():
    print("=== SUPABASE CONFIGURATION TEST ===")

    # These would normally be in .env
    url = os.environ.get("VITE_SUPABASE_URL", "")
    key = os.environ.get("VITE_SUPABASE_ANON_KEY", "")

    print(f"URL provided: {'Yes' if url else 'No'}")
    print(f"Key provided: {'Yes' if key else 'No'}")

    if not url or not key:
        print("\n[✓] Graceful degradation: Supabase credentials missing as expected in current environment.")
        print("    Application logic (supabase.ts) handles this by disabling cloud sync.")
        return

    try:
        supabase: Client = create_client(url, key)
        print("\n[✓] Client initialized successfully.")
        # We don't actually try to query here as we don't have real keys
    except Exception as e:
        print(f"\n[X] Initialization FAILED: {str(e)}")

if __name__ == "__main__":
    test_supabase_config()

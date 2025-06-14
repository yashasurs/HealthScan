"""
This script can be used to diagnose database connection issues on Heroku.
Run it with: heroku run python check_db.py
"""

import os
import sys
import socket
import time

print("=== Environment Diagnostics ===")
print(f"PORT: {os.environ.get('PORT', 'Not set')}")
print(f"DATABASE_URL: {'Set' if os.environ.get('DATABASE_URL') else 'Not set'}")

# Only show first and last 5 chars of sensitive values
def safe_print(name, value):
    if value and len(value) > 15:
        safe_val = value[:5] + "..." + value[-5:]
        print(f"{name}: {safe_val}")
    elif value:
        print(f"{name}: Set")
    else:
        print(f"{name}: Not set")

safe_print("DATABASE_URL", os.environ.get("DATABASE_URL"))
safe_print("SECRET_KEY", os.environ.get("SECRET_KEY"))

# Check DNS resolution for Supabase host
db_url = os.environ.get("DATABASE_URL", "")
if db_url and "@" in db_url:
    host = db_url.split("@")[1].split(":")[0]
    print(f"\n=== Testing DNS for host: {host} ===")
    try:
        start = time.time()
        ip = socket.gethostbyname(host)
        end = time.time()
        print(f"DNS Resolution: Success - {ip} (took {end-start:.2f}s)")
    except Exception as e:
        print(f"DNS Resolution: Failed - {e}")

# Test PostgreSQL connection
print("\n=== Testing Database Connection ===")
try:
    import psycopg2
    
    # Convert postgres:// to postgresql:// if needed
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    
    print("Connecting to PostgreSQL...")
    start = time.time()
    conn = psycopg2.connect(db_url, connect_timeout=10)
    end = time.time()
    print(f"Connection: Success (took {end-start:.2f}s)")
    
    # Check server version
    cursor = conn.cursor()
    cursor.execute("SELECT version();")
    version = cursor.fetchone()[0]
    print(f"PostgreSQL version: {version}")
    
    cursor.close()
    conn.close()
    print("Connection test completed successfully")
    
except Exception as e:
    print(f"Connection failed: {e}")
    print("\nPossible issues:")
    print("1. DATABASE_URL not correctly set in Heroku")
    print("2. IP restrictions on Supabase")
    print("3. Network connectivity issue")
    print("4. PostgreSQL server not running or rejecting connections")
    sys.exit(1)

from dotenv import load_dotenv
import os
import sys

# Always load .env from the project/server root
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Get database URL from environment
SQLALCHEMY_DATABASE_URL = os.environ.get("DATABASE_URL")

# Critical fix for Heroku: Convert postgres:// to postgresql://
if SQLALCHEMY_DATABASE_URL and SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)
    print("Converted DATABASE_URL from postgres:// to postgresql://")

# Check if database URL is set
if not SQLALCHEMY_DATABASE_URL:
    print("ERROR: DATABASE_URL environment variable is not set!")
    print("Please set DATABASE_URL in your Heroku config vars")
    # In production, exit with error
    if os.environ.get("ENV") == "production" or os.environ.get("PORT"):
        sys.exit(1)
    else:
        # In development, use a default URL
        SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
        print("Using SQLite test database for development")

# Safe printing of database URL (hide credentials)
if "@" in str(SQLALCHEMY_DATABASE_URL):
    url_parts = SQLALCHEMY_DATABASE_URL.split("@")
    safe_url = f"...@{url_parts[1]}" if len(url_parts) > 1 else "...@unknown"
    print(f"Connecting to database at {safe_url}")
else:
    print(f"Connecting to database at {SQLALCHEMY_DATABASE_URL}")

try:
    # Create engine with reasonable timeout for cloud environments
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"connect_timeout": 15} if SQLALCHEMY_DATABASE_URL.startswith("postgresql") else {},
        pool_pre_ping=True
    )
    
    # Test connection (but don't block startup on this)
    try:
        with engine.connect() as conn:
            conn.execute("SELECT 1")
            print("Database connection test successful!")
    except Exception as test_error:
        print(f"Warning: Database connection test failed: {test_error}")
except Exception as e:
    print(f"ERROR: Could not create database engine: {e}")
    # Only exit in production
    if os.environ.get("ENV") == "production" or os.environ.get("PORT"):
        sys.exit(1)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

Base = declarative_base()

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
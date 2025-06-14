from dotenv import load_dotenv
import os
import sys

# Always load .env from the project/server root
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Get the database URL from the environment variable
SQLALCHEMY_DATABASE_URL = os.environ.get("DATABASE_URL")

# Critical fix for Heroku: Convert postgres:// to postgresql://
if SQLALCHEMY_DATABASE_URL and SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)
    print(f"Converted DATABASE_URL from postgres:// to postgresql://")

# Add error handling to provide better diagnostics
if not SQLALCHEMY_DATABASE_URL:
    print("ERROR: DATABASE_URL environment variable is not set")
    print("Please set the DATABASE_URL environment variable in Heroku")
    sys.exit(1)

try:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    # Test connection
    with engine.connect() as conn:
        conn.execute("SELECT 1")
    print("Database connection successful!")
except Exception as e:
    print(f"ERROR: Failed to connect to database: {e}")
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
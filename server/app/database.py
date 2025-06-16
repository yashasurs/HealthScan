from dotenv import load_dotenv
import os

# Always load .env from the project/server root
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = os.environ.get("DATABASE_URL")
if not SQLALCHEMY_DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

# Fix Heroku postgres:// URLs to use postgresql://
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)
    print(f"Fixed database URL to: {SQLALCHEMY_DATABASE_URL}")
else:
    print(f"Database URL is already in correct format: {SQLALCHEMY_DATABASE_URL}")

# Hardcode the URL if the environment variable isn't working
# SQLALCHEMY_DATABASE_URL = "postgresql://u5cnv07a8en4pf:p2df2c0be37caeb9236cd1ace49b403bd878feee0c7b7bae9d1f67bd483cd7daa@c2fbt7u7f4htth.cluster-czz5s0kz4scl.eu-west-1.rds.amazonaws.com:5432/dg3vnaeou21p3"

print(f"Connecting to database at {SQLALCHEMY_DATABASE_URL}")

# Add some options to the engine creation to handle connection issues
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_size=5,
    max_overflow=0,
    pool_timeout=30,
    pool_recycle=1800,
    connect_args={"connect_timeout": 15}
)

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
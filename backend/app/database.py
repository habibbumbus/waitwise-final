from __future__ import annotations

from contextlib import contextmanager
from typing import Iterator
from sqlalchemy.orm import Session

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# Read database URL from environment with a sensible local default for dev.
# For production/staging set DATABASE_URL to a Postgres (or other) connection string.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./waitwise.db")

# SQLite requires a special connect arg for the same-thread check.
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}, future=True, echo=False
    )
else:
    engine = create_engine(DATABASE_URL, future=True, echo=False)

SessionLocal = sessionmaker(bind=engine, autoflush=False, future=True)


@contextmanager
def get_session() -> Iterator["Session"]:

    session: Session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
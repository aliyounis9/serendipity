"""Create database tables that don't exist yet.

Run manually with: python -m app.init_db

create_all() never changes or drops existing tables, so it's safe to run
again, but it also won't apply changes to a table that already exists.
Schema changes will need migrations (Alembic, planned for Sprint 2).
"""

from app.database import engine
from app.models import Base


def main() -> None:
    Base.metadata.create_all(bind=engine)
    print("Tables ready:", ", ".join(Base.metadata.tables))


if __name__ == "__main__":
    main()

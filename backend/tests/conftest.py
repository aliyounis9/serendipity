from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import Engine, create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session, sessionmaker

from app.config import settings
from app.database import get_db
from app.main import app
from app.models import Base

# Same server and credentials as development, different database.
DEV_URL = make_url(settings.database_url.get_secret_value())
TEST_URL = DEV_URL.set(database=f"{DEV_URL.database}_test")


def create_test_database_if_missing() -> None:
    # CREATE DATABASE can't run inside a transaction, hence AUTOCOMMIT.
    admin = create_engine(DEV_URL.set(database="postgres"), isolation_level="AUTOCOMMIT")
    with admin.connect() as conn:
        exists = conn.scalar(
            text("SELECT 1 FROM pg_database WHERE datname = :name"),
            {"name": TEST_URL.database},
        )
        if not exists:
            # Database names can't be bound parameters, so the name is quoted
            # as an identifier. It comes from our config, never from user input.
            name = conn.dialect.identifier_preparer.quote(TEST_URL.database)
            conn.execute(text(f"CREATE DATABASE {name}"))
    admin.dispose()


@pytest.fixture(scope="session")
def engine() -> Iterator[Engine]:
    # Safety guard: these fixtures delete data, so never point them at
    # anything except a test database.
    assert TEST_URL.database.endswith("_test"), "refusing to run tests on a non-test database"
    create_test_database_if_missing()
    engine = create_engine(TEST_URL)
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    yield engine
    engine.dispose()


@pytest.fixture
def db_session(engine: Engine) -> Iterator[Session]:
    # Every test starts with empty tables.
    with engine.begin() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            conn.execute(table.delete())
    with sessionmaker(bind=engine)() as session:
        yield session


@pytest.fixture
def client(db_session: Session) -> Iterator[TestClient]:
    # The app's get_db is swapped for one that uses the test database.
    def override_get_db() -> Iterator[Session]:
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

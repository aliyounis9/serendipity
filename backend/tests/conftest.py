from collections.abc import Callable, Iterator

import httpx
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import Engine, create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session, sessionmaker

from app.config import settings
from app.database import get_db
from app.main import app
from app.models import Base
from app.routers.places import get_http_client

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


def refuse_real_requests(request: httpx.Request) -> httpx.Response:
    raise AssertionError(f"test tried to make a real HTTP request to {request.url}")


def fake_http_client(handler: Callable[[httpx.Request], httpx.Response]):
    # An httpx client whose "network" is just the handler function.
    def override() -> Iterator[httpx.Client]:
        with httpx.Client(transport=httpx.MockTransport(handler)) as http:
            yield http

    return override


@pytest.fixture
def client(db_session: Session) -> Iterator[TestClient]:
    def override_get_db() -> Iterator[Session]:
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    # Tests must never call the real Google API (it's billed). Any outgoing
    # request fails unless a test installs its own fake (see test_places.py).
    app.dependency_overrides[get_http_client] = fake_http_client(refuse_real_requests)
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

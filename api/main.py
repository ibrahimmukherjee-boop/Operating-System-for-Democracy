"""FastAPI application for Operating System for a Democracy."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import countries, domains, health, policies, rankings, scoring, sources
from osd import MODEL_VERSION
from osd.db import Base, engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Operating System for a Democracy",
    description="Transparent, auditable framework for evaluating governments and policies",
    version=MODEL_VERSION,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["health"])
app.include_router(domains.router, prefix="/api/v1/domains", tags=["domains"])
app.include_router(countries.router, prefix="/api/v1/countries", tags=["countries"])
app.include_router(policies.router, prefix="/api/v1/policies", tags=["policies"])
app.include_router(rankings.router, prefix="/api/v1/rankings", tags=["rankings"])
app.include_router(scoring.router, prefix="/api/v1/scoring", tags=["scoring"])
app.include_router(sources.router, prefix="/api/v1/sources", tags=["sources"])


def run():
    import uvicorn

    from osd.config import settings

    uvicorn.run("api.main:app", host=settings.api_host, port=settings.api_port, reload=True)


if __name__ == "__main__":
    run()

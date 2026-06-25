from contextlib import closing

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api import routes
from backend.app.db import database
from backend.app.db.seed import seed

app = FastAPI(title="ProFlow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3200", "http://127.0.0.1:3200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    database.init_db()
    with closing(database.connect()) as db:
        seed(db)


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(routes.router, prefix="/api")

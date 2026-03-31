from fastapi import FastAPI
import threading
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.simulation import run_simulation

app = FastAPI(title="Adaptive Edge AI System")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# include routes
app.include_router(router)


# ----------- RUN SIMULATION IN BACKGROUND -----------
def start_simulation():
    thread = threading.Thread(target=run_simulation, daemon=True)
    thread.start()


@app.on_event("startup")
def startup_event():
    start_simulation()


@app.get("/")
def root():
    return {"message": "Edge AI System Running"}
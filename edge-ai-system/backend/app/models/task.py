from pydantic import BaseModel, Field
import time
import uuid


class Task(BaseModel):
    task_id: str = Field(default_factory=lambda: str(uuid.uuid4()))

    cpu_required: float
    memory_required: float
    data_size: float

    deadline: float
    priority: int
    task_type: str  # compute / latency / data

    arrival_time: float = Field(default_factory=time.time)
    estimated_execution_time: float

    retry_count: int = 0

    status: str = "waiting"  # waiting / running / completed / failed / cancelled
    assigned_node: str | None = None

    # FOR PREEMPTION
    is_cancelled: bool = False
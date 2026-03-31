from pydantic import BaseModel, Field
from typing import Dict, List
from app.models.task import Task


class Node(BaseModel):
    node_id: str
    node_type: str  # edge / cloud

    cpu_capacity: float
    memory_capacity: float
    energy_level: float

    current_cpu_usage: float = 0
    current_memory_usage: float = 0

    queue_length: int = 0
    active_tasks: int = 0
    max_slots: int = 3

    trust_score: float = 1.0
    failure_rate: float = 0.0

    latency_to_others: Dict[str, float] = Field(default_factory=dict)

    # 🔥 NEW FIELD (FOR PREEMPTION)
    active_task_list: List[Task] = Field(default_factory=list)
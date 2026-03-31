import random
import time
from app.models.task import Task


def generate_task():
    return Task(
        cpu_required=random.uniform(1, 5),
        memory_required=random.uniform(1, 4),
        data_size=random.uniform(10, 100),

        deadline=time.time() + random.randint(5, 20),
        priority=random.randint(1, 5),
        task_type=random.choice(["compute", "latency", "data"]),

        estimated_execution_time=random.uniform(1, 4)
    )


def generate_task_batch(n=3):
    return [generate_task() for _ in range(n)]
import random
import time
from app.models.task import Task
from app.utils.system_store import system_store


def generate_task(source_device=None):
    # ----------- REALISTIC TASK TYPES -----------
    task_type = random.choice(["sensor", "image", "analytics", "emergency"])

    if task_type == "sensor":
        cpu = random.uniform(0.5, 1.5)
        mem = random.uniform(0.5, 1.5)
        exec_time = random.uniform(0.5, 1.5)
        priority = 1

    elif task_type == "image":
        cpu = random.uniform(2, 4)
        mem = random.uniform(2, 4)
        exec_time = random.uniform(1, 3)
        priority = 2

    elif task_type == "analytics":
        cpu = random.uniform(4, 8)
        mem = random.uniform(4, 8)
        exec_time = random.uniform(3, 6)
        priority = 1

    else:  # emergency
        cpu = random.uniform(2, 3)
        mem = random.uniform(2, 3)
        exec_time = random.uniform(0.5, 2)
        priority = 3

    return Task(
        cpu_required=cpu,
        memory_required=mem,
        data_size=random.uniform(5, 50),

        deadline=time.time() + random.randint(10, 60),
        priority=priority,
        task_type=task_type,

        estimated_execution_time=exec_time,

        source_device=source_device
    )


def generate_task_batch(n=3):
    tasks = []

    # 🔥 get IoT devices
    iot_nodes = [
        node_id
        for node_id, node in system_store.nodes.items()
        if node.node_type == "iot"
    ]

    if not iot_nodes:
        return tasks  # safety

    for device in iot_nodes:

        # ----------- INITIALIZE STATE (IF NOT EXISTS) -----------
        if device not in system_store.iot_states:
            system_store.iot_states[device] = "idle"

        current_state = system_store.iot_states[device]

        # ----------- STATE TRANSITION -----------
        if current_state == "idle":
            # 20% chance to become active
            if random.random() < 0.2:
                current_state = "active"
        else:
            # 40% chance to go back to idle
            if random.random() < 0.4:
                current_state = "idle"

        system_store.iot_states[device] = current_state

        # ----------- TASK GENERATION BASED ON STATE -----------
        if current_state == "idle":
            num_tasks = random.randint(0, 1)
        else:
            num_tasks = random.randint(3, 6)  # 🔥 burst

        for _ in range(num_tasks):
            task = generate_task(source_device=device)
            tasks.append(task)

    return tasks
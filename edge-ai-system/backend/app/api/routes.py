from fastapi import APIRouter
from app.utils.system_store import system_store

router = APIRouter()


# ----------- NODE METRICS -----------
@router.get("/node/metrics/{node_id}")
def get_node_metrics(node_id: str):
    node = system_store.nodes.get(node_id)

    if not node:
        return {"error": "Node not found"}

    return {
        "node_id": node.node_id,
        "cpu_usage": node.current_cpu_usage,
        "memory_usage": node.current_memory_usage,
        "queue_length": node.queue_length,
        "active_tasks": node.active_tasks,
        "trust_score": node.trust_score,
        "failure_rate": node.failure_rate
    }


# ----------- ALL NODES -----------
@router.get("/nodes")
def get_all_nodes():
    return {
        node_id: {
            "running": node.active_tasks,
            "queue": node.queue_length,
            "trust": node.trust_score
        }
        for node_id, node in system_store.nodes.items()
    }


# ----------- TASK STATUS -----------
@router.get("/task/status/{task_id}")
def get_task_status(task_id: str):
    task = system_store.tasks.get(task_id)

    if not task:
        return {"error": "Task not found"}

    return {
        "task_id": task.task_id,
        "status": task.status,
        "assigned_node": task.assigned_node
    }


# ----------- ALL TASKS (ENHANCED) -----------
@router.get("/tasks")
def get_all_tasks():
    return [
        {
            "task_id": t.task_id,
            "status": t.status,
            "node": t.assigned_node,
            "created_at": t.arrival_time,
            "source": getattr(t, "source_device", None)  # 🔥 NEW
        }
        for t in system_store.tasks.values()
    ]


# ----------- EVENTS (PREEMPTION ETC.) -----------
@router.get("/events")
def get_events():
    return system_store.events[-20:]


# ----------- LEARNING DATA -----------
@router.get("/learning")
def get_learning():
    return system_store.learning_history


# ----------- CONFIG -----------
@router.get("/config")
def get_config():
    return {
        "simulation_interval": getattr(system_store, "simulation_interval", 12)
    }


# ============================================================
# 🔥 NEW — SYSTEM METRICS (STEP 4 CORE)
# ============================================================

@router.get("/metrics")
def get_system_metrics():
    total = system_store.total_tasks
    completed = system_store.completed_tasks
    failed = system_store.failed_tasks

    success_rate = (completed / total) * 100 if total > 0 else 0
    failure_rate = (failed / total) * 100 if total > 0 else 0

    return {
        "total_tasks": total,
        "completed_tasks": completed,
        "failed_tasks": failed,
        "success_rate": round(success_rate, 2),
        "failure_rate": round(failure_rate, 2)
    }

# ----------- SIMULATION CONTROL -----------

@router.post("/simulation/pause")
def pause_simulation():
    system_store.simulation_running = False
    return {"status": "paused"}


@router.post("/simulation/play")
def play_simulation():
    system_store.simulation_running = True
    return {"status": "running"}
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


# ----------- ALL TASKS -----------
@router.get("/tasks")
def get_all_tasks():
    return [
        {
            "task_id": t.task_id,
            "status": t.status,
            "node": t.assigned_node
        }
        for t in system_store.tasks.values()
    ]


# 🔥 NEW — PREEMPTION EVENTS (FOR DASHBOARD)
@router.get("/events")
def get_events():
    return system_store.events[-20:]  # last 20 events
from typing import Dict, List
from app.models.node import Node


class SystemStore:
    def __init__(self):
        self.nodes: Dict[str, Node] = {}
        self.tasks = {}

        self.events: List[dict] = []
        self.learning_history: List[dict] = []

        # IoT states
        self.iot_states: Dict[str, str] = {}

        # Network state
        self.network_state = {
            "edge_to_cloud_latency": 5,
            "congestion": False
        }

        # 🔥 NEW — METRICS
        self.total_tasks: int = 0
        self.completed_tasks: int = 0
        self.failed_tasks: int = 0
        self.simulation_interval: int = 6
        self.simulation_running: bool = True
# singleton instance
system_store = SystemStore()
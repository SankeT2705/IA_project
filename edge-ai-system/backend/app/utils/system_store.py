from typing import Dict
from app.models.node import Node


class SystemStore:
    def __init__(self):
        self.nodes: Dict[str, Node] = {}
        self.tasks = {}
        self.events: List[dict] = []
        self.learning_history: List[dict] = []
# singleton instance
system_store = SystemStore()
from typing import Dict
from app.models.node import Node


class SystemState:
    def __init__(self):
        self.nodes: Dict[str, Node] = {}
        self.tasks = {}

    def add_node(self, node: Node):
        self.nodes[node.node_id] = node

    def get_node(self, node_id: str):
        return self.nodes.get(node_id)

    def add_task(self, task):
        self.tasks[task.task_id] = task

    def get_task(self, task_id: str):
        return self.tasks.get(task_id)
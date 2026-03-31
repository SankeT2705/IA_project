from app.agents.resource_manager import ResourceManager
from app.utils.system_store import system_store


class CloudController:
    def __init__(self, nodes, bus):
        self.nodes = nodes
        self.bus = bus

        # 🔥 central intelligence
        self.resource_manager = ResourceManager(nodes, bus)

    def allocate_task(self, task):
        node, score = self.resource_manager.allocate_task(task)

        return node, score

    def get_system_state(self):
        return system_store.nodes

    def broadcast_alert(self, message):
        self.bus.publish(message)
from app.services.decision_engine import DecisionEngine


class ResourceManager:
    def __init__(self, nodes, bus):
        self.nodes = nodes
        self.engine = DecisionEngine()
        self.bus = bus

        bus.subscribe(self)

    def allocate_task(self, task):
        selected_node, score = self.engine.select_best_node(task, self.nodes)
        return selected_node, score

    def receive_message(self, message):
        if message["type"] == "malicious_node":
            node_id = message["node_id"]

            if node_id in self.nodes:
                self.nodes[node_id].trust_score = 0
                print(f"🤖 RM updated: {node_id} avoided")
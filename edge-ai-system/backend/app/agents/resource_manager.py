from app.services.decision_engine import DecisionEngine


class ResourceManager:
    def __init__(self, nodes, bus,engine):
        self.nodes = nodes
        self.engine = engine
        self.bus = bus

        self.learning_module = None  #  RL attach later

        bus.subscribe(self)

    def allocate_task(self, task):
        best_node = None
        best_score = float("-inf")

        for node in self.nodes.values():

            # skip full nodes
            if node.active_tasks >= node.max_slots:
                continue

            # FIX: use compute_utility (correct function)
            heuristic_score = self.engine.compute_utility(
                task, node, self.nodes
            )

            # ----------- RL SCORE -----------
            rl_score = 0
            if self.learning_module:
                try:
                    rl_score = self.learning_module.get_q_value(node, task)
                except Exception:
                    rl_score = 0

            final_score = heuristic_score + rl_score

            if final_score > best_score:
                best_score = final_score
                best_node = node

        return best_node, best_score

    def receive_message(self, message):
        if message["type"] == "malicious_node":
            node_id = message["node_id"]

            if node_id in self.nodes:
                self.nodes[node_id].trust_score = 0
                print(f"==> RM updated: {node_id} avoided")
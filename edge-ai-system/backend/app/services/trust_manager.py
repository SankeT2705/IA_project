class TrustManager:
    def __init__(self, nodes, bus, learning_module=None):
        self.nodes = nodes
        self.bus = bus
        self.learning_module = learning_module

    def update_after_task(self, node, task):
        if task.status == "failed":
            node.failure_rate += 0.1
            node.trust_score -= 0.1
        else:
            node.trust_score += 0.02

        # clamp
        node.trust_score = max(0, min(1, node.trust_score))
        node.failure_rate = max(0, min(1, node.failure_rate))

        # 🔥 CALL LEARNING MODULE
        if self.learning_module:
            self.learning_module.update_weights(node, task)

        # malicious detection
        if node.trust_score < 0.3:
            self.flag_malicious(node)

    def flag_malicious(self, node):
        message = {
            "type": "malicious_node",
            "node_id": node.node_id
        }

        print(f"🚨 ALERT: {node.node_id} marked as MALICIOUS")

        self.bus.broadcast(message)
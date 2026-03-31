class LearningModule:
    def __init__(self, decision_engine):
        self.engine = decision_engine

    def update_weights(self, node, task):

        weights = self.engine.weights

        # ----------- LATENCY ADAPTATION -----------
        if task.estimated_execution_time > 3:
            weights["latency"] += 0.05
        else:
            weights["latency"] -= 0.02

        # ----------- FAILURE ADAPTATION -----------
        if task.status == "failed":
            weights["success"] += 0.1
            weights["trust"] += 0.05
        else:
            weights["success"] -= 0.02

        # ----------- QUEUE ADAPTATION -----------
        if node.queue_length > 3:
            weights["queue"] += 0.05
        else:
            weights["queue"] -= 0.02

        # ----------- RESOURCE ADAPTATION -----------
        if node.current_cpu_usage > 0.8 * node.cpu_capacity:
            weights["resource"] += 0.05
        else:
            weights["resource"] -= 0.02

        # ----------- CLAMP WEIGHTS (IMPORTANT) -----------
        for key in weights:
            weights[key] = max(0.1, min(3.0, weights[key]))

        print(f"🧠 Learning Updated Weights: { {k: round(v,2) for k,v in weights.items()} }")
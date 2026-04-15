import time
from app.utils.system_store import system_store


class LearningModule:
    def __init__(self, decision_engine):
        self.engine = decision_engine

        # 🔥 RL PARAMETERS
        self.q_table = {}   # (state, node_id) → value
        self.alpha = 0.1
        self.gamma = 0.9

    # ----------- STATE -----------
    def get_state(self, node, task):
        return (
            round(node.queue_length / 5, 1),
            round(node.trust_score, 1),
            round(task.estimated_execution_time / 5, 1)
        )

    # ----------- REWARD -----------
    def get_reward(self, node, task):
        reward = 0

        if task.status == "completed":
            reward += 1
        else:
            reward -= 1

        reward -= task.estimated_execution_time * 0.1
        reward -= node.queue_length * 0.05

        return reward

    # ----------- UPDATE -----------
    def update_weights(self, node, task):

        weights = self.engine.weights

        # ----------- EXISTING LOGIC (UNCHANGED) -----------
        if task.estimated_execution_time > 3:
            weights["latency"] += 0.05
        else:
            weights["latency"] -= 0.02

        if task.status == "failed":
            weights["success"] += 0.1
            weights["trust"] += 0.05
        else:
            weights["success"] -= 0.02

        if node.queue_length > 3:
            weights["queue"] += 0.05
        else:
            weights["queue"] -= 0.02

        if node.current_cpu_usage > 0.8 * node.cpu_capacity:
            weights["resource"] += 0.05
        else:
            weights["resource"] -= 0.02

        # ----------- CLAMP -----------
        for key in weights:
            weights[key] = max(0.1, min(3.0, weights[key]))

        # 🔥 RL UPDATE
        state = self.get_state(node, task)
        action = node.node_id

        key = (state, action)
        old_value = self.q_table.get(key, 0)

        reward = self.get_reward(node, task)

        new_value = old_value + self.alpha * (reward - old_value)
        self.q_table[key] = new_value

        # 🔥 STORE HISTORY
        system_store.learning_history.append({
            "time": time.time(),
            **weights
        })

        system_store.learning_history = system_store.learning_history[-100:]

        print(
            f"🧠 Learning Updated | Reward: {round(reward,2)} | Q: {round(new_value,2)}"
        )

    # 🔥 GET RL SCORE
    def get_q_value(self, node, task):
        state = self.get_state(node, task)
        return self.q_table.get((state, node.node_id), 0)
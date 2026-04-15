import random


class DecisionEngine:
    def __init__(self):
        # weights (can be adapted later)
        self.weights = {
            "latency": 1.0,
            "resource": 1.2,
            "energy": 0.8,
            "success": 1.5,
            "migration": 0.5,
            "trust": 1.5,
            "queue": 1.0
        }

    def compute_utility(self, task, node, all_nodes):
        # ---------- LATENCY ----------
        latency = self.get_latency(task, node, all_nodes)

        # ---------- RESOURCE EFFICIENCY ----------
        cpu_available = node.cpu_capacity - node.current_cpu_usage
        mem_available = node.memory_capacity - node.current_memory_usage

        resource_efficiency = min(
            cpu_available / (task.cpu_required + 1e-5),
            mem_available / (task.memory_required + 1e-5)
        )

        # ---------- ENERGY ----------
        energy = node.energy_level

        # ---------- SUCCESS RATE ----------
        success_rate = 1 - node.failure_rate

        # ---------- MIGRATION COST ----------
        migration_cost = task.data_size * latency * 0.01

        # ---------- TRUST ----------
        trust_score = node.trust_score

        # ---------- QUEUE DELAY ----------
        queue_delay = node.queue_length + node.active_tasks

        # ---------- BASE UTILITY ----------
        U = (
            self.weights["latency"] * (-latency)
            + self.weights["resource"] * resource_efficiency
            + self.weights["energy"] * (energy * 0.01)
            + self.weights["success"] * success_rate
            - self.weights["migration"] * migration_cost
            + self.weights["trust"] * trust_score
            - self.weights["queue"] * queue_delay
        )

        # ============================================================
        # 🔥 NEW: LOAD-AWARE CLOUD UTILIZATION (NO BREAKING CHANGE)
        # ============================================================

        total_load = sum(n.queue_length + n.active_tasks for n in all_nodes.values())
        node_count = max(len(all_nodes), 1)
        avg_load = total_load / node_count

        node_load = node.queue_length + node.active_tasks

        # ✅ CASE 1: SYSTEM OVERLOADED → USE CLOUD MORE
        if avg_load > 3:
            if node.node_type == "cloud":
                U += 2.0  # boost cloud usage
            else:
                if node_load > avg_load:
                    U -= 1.5  # penalize overloaded edges

        # ✅ CASE 2: LOCAL EDGE OVERLOAD → SHIFT TO CLOUD
        if node.node_type == "edge" and node_load > 5:
            U -= 2.0  # strong penalty

        if node.node_type == "cloud" and node_load < avg_load:
            U += 1.0  # encourage cloud usage

        return U

    def get_latency(self, task, node, all_nodes):
        # simple simulated latency
        base_latency = random.uniform(1, 10)

        if node.node_type == "cloud":
            return base_latency + 5  # cloud slower

        return base_latency

    def select_best_node(self, task, nodes):
        best_node = None
        best_score = float("-inf")

        for node in nodes.values():
            score = self.compute_utility(task, node, nodes)

            if score > best_score:
                best_score = score
                best_node = node

        return best_node, best_score
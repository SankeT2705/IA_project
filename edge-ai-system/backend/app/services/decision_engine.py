import random
from app.utils.system_store import system_store


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

        # ---------- MIGRATION COST (UPDATED) ----------
        if node.node_type == "cloud":
            migration_cost = task.data_size * latency * 0.05
        elif node.node_type == "edge":
            migration_cost = task.data_size * latency * 0.02
        else:  # IoT
            migration_cost = 0

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
        # 🔥 LOAD-AWARE CLOUD UTILIZATION
        # ============================================================

        total_load = sum(n.queue_length + n.active_tasks for n in all_nodes.values())
        node_count = max(len(all_nodes), 1)
        avg_load = total_load / node_count

        node_load = node.queue_length + node.active_tasks

        if avg_load > 3:
            if node.node_type == "cloud":
                U += 2.0
            else:
                if node_load > avg_load:
                    U -= 1.5

        if node.node_type == "edge" and node_load > 5:
            U -= 2.0

        if node.node_type == "cloud" and node_load < avg_load:
            U += 1.0

        # ============================================================
        # 🔥 IoT LOCAL EXECUTION
        # ============================================================

        if node.node_type == "iot":
            if task.cpu_required <= 2:
                U += 2.0
            else:
                U -= 2.5

        # ============================================================
        # 🔥 NETWORK-AWARE DECISION (NEW)
        # ============================================================

        network = system_store.network_state

        if node.node_type == "cloud":
            if network["congestion"]:
                U -= 3.0   # avoid cloud when network bad

        # ============================================================
        # 🔥 CLOUD DOMINATION CONTROL (IMPORTANT FIX)
        # ============================================================

        if node.node_type == "cloud":
            if task.cpu_required < 4 and not network["congestion"]:
                U -= 2.5   # avoid unnecessary cloud use

        if node.node_type == "edge" and task.cpu_required < 5:
            U += 1.5   # encourage edge

        return U

    def get_latency(self, task, node, all_nodes):
        base_latency = random.uniform(1, 5)

        if node.node_type == "iot":
            return base_latency

        if node.node_type == "edge":
            return base_latency + 1

        if node.node_type == "cloud":
            net_latency = system_store.network_state["edge_to_cloud_latency"]
            return base_latency + net_latency

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
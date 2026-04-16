import time
import random

from app.utils.system_store import system_store
from app.models.node import Node
from app.core.queue_manager import TaskQueue
from app.core.worker import Worker
from app.core.task_generator import generate_task_batch

from app.agents.resource_manager import ResourceManager
from app.agents.scheduler import Scheduler

from app.services.communication import CommunicationBus
from app.services.trust_manager import TrustManager
from app.services.learning import LearningModule
from app.services.decision_engine import DecisionEngine


# 🔥 DYNAMIC NODE CREATION WITH IOT
def create_nodes():
    nodes = {}

    # ----------- IoT NODES -----------
    num_iot = random.randint(3, 5)

    for i in range(num_iot):
        node_id = f"iot_{i+1}"

        nodes[node_id] = Node(
            node_id=node_id,
            node_type="iot",
            cpu_capacity=2,
            memory_capacity=2,
            energy_level=random.randint(40, 80),
            max_slots=1
        )

    # ----------- EDGE NODES -----------
    num_edges = random.randint(2, 4)

    for i in range(num_edges):
        node_id = f"edge_{i+1}"

        nodes[node_id] = Node(
            node_id=node_id,
            node_type="edge",
            cpu_capacity=random.randint(6, 10),
            memory_capacity=random.randint(6, 10),
            energy_level=100,
            max_slots=2
        )

    # ----------- CLOUD NODE -----------
    nodes["cloud"] = Node(
        node_id="cloud",
        node_type="cloud",
        cpu_capacity=32,
        memory_capacity=64,
        energy_level=500,
        max_slots=5
    )

    print(f"\n🌐 Created {num_iot} IoT + {num_edges} Edge + Cloud\n")
    return nodes


def run_simulation():
    try:
        # 🔥 RESET SYSTEM
        system_store.nodes = {}
        system_store.tasks = {}
        system_store.events = []
        system_store.simulation_interval = 6
        # 🔥 INITIAL NETWORK STATE (NEW)
        system_store.network_state = {
            "edge_to_cloud_latency": 5,
            "congestion": False
        }

        print("⏳ Initializing system...")
        time.sleep(7)

        nodes = create_nodes()
        system_store.nodes = nodes

        # ----------- INIT COMPONENTS -----------
        bus = CommunicationBus()

        decision_engine = DecisionEngine()
        learning_module = LearningModule(decision_engine)
        trust_manager = TrustManager(nodes, bus, learning_module)

        resource_manager = ResourceManager(nodes, bus, decision_engine)
        resource_manager.learning_module = learning_module

        schedulers = {}

        for node_id, node in nodes.items():
            queue = TaskQueue()
            worker = Worker(node, trust_manager)
            scheduler = Scheduler(node, queue, worker, bus)

            schedulers[node_id] = scheduler

        print("🚀 IoT–Edge–Cloud Adaptive System Started\n")

        # ----------- MAIN LOOP -----------
        while True:

            # ======================================================
            # 🔥 NEW: NETWORK DYNAMICS (STEP 3 ADDITION)
            # ======================================================
            if random.random() < 0.3:
                system_store.network_state["edge_to_cloud_latency"] = random.uniform(8, 20)
                system_store.network_state["congestion"] = True
                print("🌐 Network Congested (High latency to cloud)")
            else:
                system_store.network_state["edge_to_cloud_latency"] = random.uniform(3, 6)
                system_store.network_state["congestion"] = False

            # ----------- TASK GENERATION -----------
            batch_size = random.randint(3, 10)
            tasks = generate_task_batch(batch_size)

            print(f"\n🆕 Generated {len(tasks)} tasks")

            # ----------- ALLOCATION -----------
            for task in tasks:
                node, score = resource_manager.allocate_task(task)

                if node is None:
                    print(f"⚠ No node available for task {task.task_id[:6]}")
                    continue

                system_store.tasks[task.task_id] = task
                schedulers[node.node_id].add_task(task)

                print(
                    f"🤖 RM → Task {task.task_id[:6]} → {node.node_id} "
                    f"| Utility Score: {round(score, 3)}"
                )

            # ----------- EXECUTION -----------
            for scheduler in schedulers.values():
                scheduler.schedule()

            # ----------- SYSTEM STATE -----------
            print("\n📊 SYSTEM STATE")
            print("-" * 70)

            for node_id, node in nodes.items():
                load = node.active_tasks + node.queue_length

                print(
                    f"{node_id:<8} | "
                    f"{node.node_type.upper():<5} | "
                    f"Run: {node.active_tasks:<2} | "
                    f"Queue: {node.queue_length:<2} | "
                    f"Load: {load:<2} | "
                    f"Trust: {round(node.trust_score,2):<4} | "
                    f"Fail: {round(node.failure_rate,2)}"
                )

            print("-" * 70)

            time.sleep(system_store.simulation_interval)

    except Exception as e:
        print(f"❌ Simulation Error: {e}")


if __name__ == "__main__":
    run_simulation()
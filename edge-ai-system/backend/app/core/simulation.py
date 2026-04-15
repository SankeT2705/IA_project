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


# 🔥 DYNAMIC NODE CREATION
def create_nodes():
    nodes = {}

    num_edges = random.randint(2, 6)

    for i in range(num_edges):
        node_id = f"edge_{i+1}"

        nodes[node_id] = Node(
            node_id=node_id,
            node_type="edge",
            cpu_capacity=random.randint(6, 12),
            memory_capacity=random.randint(6, 12),
            energy_level=100,
            max_slots=random.randint(2, 4)
        )

    nodes["cloud"] = Node(
        node_id="cloud",
        node_type="cloud",
        cpu_capacity=20,
        memory_capacity=20,
        energy_level=200,
        max_slots=5
    )

    print(f"\n🌐 Created {num_edges} edge nodes + 1 cloud\n")
    return nodes


def run_simulation():
    try:
        # 🔥 RESET SYSTEM (IMPORTANT FIX)
        system_store.nodes = {}
        system_store.tasks = {}
        system_store.events = []

        # 🔥 NODE CREATION DELAY (FOR DEMO)
        print("⏳ Initializing system...")
        time.sleep(7)

        nodes = create_nodes()
        system_store.nodes = nodes

        # ----------- INIT COMPONENTS -----------
        bus = CommunicationBus()

        decision_engine = DecisionEngine()
        learning_module = LearningModule(decision_engine)
        trust_manager = TrustManager(nodes, bus, learning_module)
        
        resource_manager = ResourceManager(nodes, bus,decision_engine)
        resource_manager.learning_module = learning_module
        schedulers = {}

        for node_id, node in nodes.items():
            queue = TaskQueue()
            worker = Worker(node, trust_manager)
            scheduler = Scheduler(node, queue, worker, bus)

            schedulers[node_id] = scheduler

        print("🚀 Intelligent Adaptive Multi-Agent System Started\n")

        # ----------- MAIN LOOP -----------
        while True:

            # 🔥 RANDOM TASK GENERATION (3–10)
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
            print("-" * 60)

            for node_id, node in nodes.items():
                load = node.active_tasks + node.queue_length

                print(
                    f"{node_id:<8} | "
                    f"Run: {node.active_tasks:<2} | "
                    f"Queue: {node.queue_length:<2} | "
                    f"Load: {load:<2} | "
                    f"Trust: {round(node.trust_score,2):<4} | "
                    f"Fail: {round(node.failure_rate,2)}"
                )

            print("-" * 60)

            time.sleep(3)

    except Exception as e:
        print(f"❌ Simulation Error: {e}")


if __name__ == "__main__":
    run_simulation()
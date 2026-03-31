import time
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


def run_simulation():
    try:
        # ----------- CREATE NODES -----------
        nodes = {
            "edge_1": Node(
                node_id="edge_1",
                node_type="edge",
                cpu_capacity=10,
                memory_capacity=10,
                energy_level=100,
                max_slots=2
            ),
            "edge_2": Node(
                node_id="edge_2",
                node_type="edge",
                cpu_capacity=8,
                memory_capacity=8,
                energy_level=100,
                max_slots=2
            ),
            "cloud": Node(
                node_id="cloud",
                node_type="cloud",
                cpu_capacity=20,
                memory_capacity=20,
                energy_level=200,
                max_slots=4
            )
        }

        # 🔥 expose nodes to API
        system_store.nodes = nodes

        # ----------- COMMUNICATION BUS -----------
        bus = CommunicationBus()

        # ----------- DECISION ENGINE -----------
        decision_engine = DecisionEngine()

        # ----------- LEARNING MODULE -----------
        learning_module = LearningModule(decision_engine)

        # ----------- TRUST MANAGER -----------
        trust_manager = TrustManager(nodes, bus, learning_module)

        # ----------- RESOURCE MANAGER -----------
        resource_manager = ResourceManager(nodes, bus)
        resource_manager.engine = decision_engine  # shared engine

        # ----------- SCHEDULERS -----------
        schedulers = {}

        for node_id, node in nodes.items():
            queue = TaskQueue()
            worker = Worker(node, trust_manager)
            scheduler = Scheduler(node, queue, worker, bus)

            schedulers[node_id] = scheduler

        print("🚀 Intelligent Adaptive Multi-Agent System Started...\n")

        # ----------- MAIN LOOP -----------
        while True:

            # 🔹 1. Generate tasks
            tasks = generate_task_batch(5)
            print(f"\n🆕 Generated {len(tasks)} tasks")

            # 🔹 2. Allocate tasks
            for task in tasks:
                node, score = resource_manager.allocate_task(task)

                if node is None:
                    print(f"⚠ No node available for task {task.task_id[:6]}")
                    continue

                # 🔥 STORE TASK FOR API
                system_store.tasks[task.task_id] = task

                schedulers[node.node_id].add_task(task)

                print(
                    f"🤖 RM → Task {task.task_id[:6]} → {node.node_id} | Score: {round(score,2)}"
                )

            # 🔹 3. Execute tasks
            for scheduler in schedulers.values():
                scheduler.schedule()

            # 🔹 4. System state
            print("\n📊 SYSTEM STATE")
            for node_id, node in nodes.items():
                print(
                    f"{node_id} | Running: {node.active_tasks} | Queue: {node.queue_length} | "
                    f"Trust: {round(node.trust_score,2)} | Failure: {round(node.failure_rate,2)}"
                )

            time.sleep(3)

    except Exception as e:
        print(f"❌ Simulation Error: {e}")


if __name__ == "__main__":
    run_simulation()
import threading
import time
import random
from app.utils.system_store import system_store


class Worker:
    def __init__(self, node, trust_manager):
        self.node = node
        self.trust_manager = trust_manager

    def execute_task(self, task):
        def run():
            task.status = "running"
            task.assigned_node = self.node.node_id

            # 🔥 COUNT TOTAL TASK (ONLY ON START)
            system_store.total_tasks += 1

            self.node.active_tasks += 1
            self.node.active_task_list.append(task)

            start_time = time.time()

            # 🔥 INTERRUPTIBLE EXECUTION
            total_time = int(task.estimated_execution_time * 10)

            for _ in range(total_time):

                # 🔥 PREEMPTION CHECK
                if getattr(task, "is_cancelled", False):
                    task.status = "cancelled"
                    print(f"⛔ Task {task.task_id[:6]} cancelled")

                    self.node.active_tasks -= 1
                    self.node.active_task_list.remove(task)
                    return

                time.sleep(0.1)

            end_time = time.time()
            completion_time = end_time - task.arrival_time

            # ======================================================
            # 🔥 DEADLINE CHECK (NEW CORE LOGIC)
            # ======================================================
            if end_time > task.deadline:
                task.status = "failed"
                system_store.failed_tasks += 1
                print(f"❌ Task {task.task_id[:6]} missed deadline")
            else:
                # simulate random failure (existing)
                if random.random() < 0.15:
                    task.status = "failed"
                    system_store.failed_tasks += 1
                else:
                    task.status = "completed"
                    system_store.completed_tasks += 1

            # 🔥 TRUST UPDATE
            self.trust_manager.update_after_task(self.node, task)

            self.node.active_tasks -= 1
            self.node.active_task_list.remove(task)

        thread = threading.Thread(target=run)
        thread.start()
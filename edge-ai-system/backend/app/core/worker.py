import threading
import time
import random


class Worker:
    def __init__(self, node, trust_manager):
        self.node = node
        self.trust_manager = trust_manager

    def execute_task(self, task):
        def run():
            task.status = "running"
            task.assigned_node = self.node.node_id

            self.node.active_tasks += 1
            self.node.active_task_list.append(task)  # 🔥 track running task

            # 🔥 INTERRUPTIBLE EXECUTION (supports preemption)
            total_time = int(task.estimated_execution_time * 10)

            for _ in range(total_time):
                # 🔥 CHECK FOR CANCELLATION
                if task.is_cancelled:
                    task.status = "cancelled"
                    print(f"⛔ Task {task.task_id[:6]} cancelled")

                    self.node.active_tasks -= 1
                    self.node.active_task_list.remove(task)
                    return

                time.sleep(0.1)

            # simulate failure
            if random.random() < 0.15:
                task.status = "failed"
            else:
                task.status = "completed"

            # update trust
            self.trust_manager.update_after_task(self.node, task)

            self.node.active_tasks -= 1
            self.node.active_task_list.remove(task)

        thread = threading.Thread(target=run)
        thread.start()
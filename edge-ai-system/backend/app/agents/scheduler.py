from app.utils.system_store import system_store


class Scheduler:
    def __init__(self, node, queue, worker, bus):
        self.node = node
        self.queue = queue
        self.worker = worker
        self.bus = bus

        bus.subscribe(self)

    def add_task(self, task):
        self.queue.add_task(task)
        self.node.queue_length += 1

    #  PREEMPTION LOGIC + EVENT LOGGING
    def preempt_if_needed(self, new_task):
        # No running tasks → nothing to preempt
        if not self.node.active_task_list:
            return

        # Find lowest priority running task
        lowest_task = min(self.node.active_task_list, key=lambda t: t.priority)

        # If new task is more important → cancel old one
        if new_task.priority > lowest_task.priority:
            print(
                f"⚡ Preempting task {lowest_task.task_id[:6]} "
                f"(P{lowest_task.priority}) for {new_task.task_id[:6]} (P{new_task.priority})"
            )

            #  Trigger cancellation
            lowest_task.is_cancelled = True

            # STORE EVENT (FOR DASHBOARD)
            system_store.events.append({
                "type": "preemption",
                "old_task": lowest_task.task_id,
                "new_task": new_task.task_id,
                "node": self.node.node_id
            })

    def schedule(self):
        while self.queue.size() > 0:

            # Allow scheduling even if full (for preemption)
            if self.node.active_tasks >= self.node.max_slots:
                next_task = self.queue.peek()

                if next_task:
                    self.preempt_if_needed(next_task)

                break

            task = self.queue.get_task()

            if task is None:
                break

            self.node.queue_length -= 1

            #  Preemption before execution
            self.preempt_if_needed(task)

            self.worker.execute_task(task)

    def receive_message(self, message):
        if message["type"] == "malicious_node":
            if message["node_id"] == self.node.node_id:
                print(f"⚠ Scheduler stopping tasks on {self.node.node_id}")
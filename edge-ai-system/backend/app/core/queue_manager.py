from queue import PriorityQueue
import itertools


class TaskQueue:
    def __init__(self):
        self.queue = PriorityQueue()
        self.counter = itertools.count()

    def add_task(self, task):
        # 🔥 higher priority first → use negative
        self.queue.put((-task.priority, next(self.counter), task))

    def get_task(self):
        if not self.queue.empty():
            return self.queue.get()[2]
        return None

    def size(self):
        return self.queue.qsize()

    # ✅ SAFE PEEK (IMPORTANT FIX)
    def peek(self):
        if not self.queue.empty():
            return self.queue.queue[0][2]  # access internal heap
        return None
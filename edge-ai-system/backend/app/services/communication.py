class CommunicationBus:
    def __init__(self):
        self.subscribers = []

    def subscribe(self, agent):
        self.subscribers.append(agent)

    def broadcast(self, message):
        for agent in self.subscribers:
            agent.receive_message(message)
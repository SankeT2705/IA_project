from typing import Dict


class Network:
    def __init__(self):
        self.latency_matrix: Dict[str, Dict[str, float]] = {}
        self.bandwidth_matrix: Dict[str, Dict[str, float]] = {}

    def set_latency(self, node_a: str, node_b: str, latency: float):
        self.latency_matrix.setdefault(node_a, {})[node_b] = latency
        self.latency_matrix.setdefault(node_b, {})[node_a] = latency

    def get_latency(self, node_a: str, node_b: str) -> float:
        return self.latency_matrix.get(node_a, {}).get(node_b, 0)

    def set_bandwidth(self, node_a: str, node_b: str, bw: float):
        self.bandwidth_matrix.setdefault(node_a, {})[node_b] = bw
        self.bandwidth_matrix.setdefault(node_b, {})[node_a] = bw

    def get_bandwidth(self, node_a: str, node_b: str) -> float:
        return self.bandwidth_matrix.get(node_a, {}).get(node_b, 0)
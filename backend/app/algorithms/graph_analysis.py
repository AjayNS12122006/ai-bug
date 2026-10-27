from collections import deque
from heapq import heappush, heappop
from typing import Dict, List, Tuple, Set


def build_adjacency_list(graph: Dict[str, List[str]]) -> Dict[str, List[str]]:
    cleaned: Dict[str, List[str]] = {}
    for node, neighbors in graph.items():
        cleaned[node] = sorted(dict.fromkeys(neighbors))
    return cleaned


def build_reverse_graph(graph: Dict[str, List[str]]) -> Dict[str, List[str]]:
    reverse: Dict[str, List[str]] = {node: [] for node in graph}
    for node, neighbors in graph.items():
        for neighbor in neighbors:
            reverse.setdefault(neighbor, [])
            reverse[neighbor].append(node)
    return {node: sorted(dict.fromkeys(neighbors)) for node, neighbors in reverse.items()}


def bfs_propagation(graph: Dict[str, List[str]], source: str) -> Dict[str, object]:
    if not graph:
        return {"visited": [], "path": [], "distances": {}, "levels": {}, "affected_modules": []}
    if source not in graph:
        return {"visited": [source], "path": [source], "distances": {source: 0}, "levels": {0: [source]}, "affected_modules": [{"module": source, "distance": 0}]}

    queue = deque([(source, 0)])
    visited = {source}
    distances = {source: 0}
    levels = {0: [source]}
    previous = {source: None}
    order: List[str] = []
    affected: List[Dict[str, object]] = []

    while queue:
        current, depth = queue.popleft()
        order.append(current)
        affected.append({"module": current, "distance": depth})
        for neighbor in sorted(graph.get(current, [])):
            if neighbor not in visited:
                visited.add(neighbor)
                distances[neighbor] = depth + 1
                previous[neighbor] = current
                levels.setdefault(depth + 1, []).append(neighbor)
                queue.append((neighbor, depth + 1))

    return {"visited": order, "path": order, "distances": distances, "previous": previous, "levels": levels, "affected_modules": affected}


def dfs_propagation(graph: Dict[str, List[str]], source: str) -> Dict[str, object]:
    if not graph:
        return {"visited": [], "reachable": [], "path": [], "affected_modules": []}
    if source not in graph:
        return {"visited": [source], "reachable": [source], "path": [source], "affected_modules": [{"module": source, "distance": 0}]}

    visited: Set[str] = set()
    stack = [source]
    traversal: List[str] = []

    while stack:
        current = stack.pop()
        if current in visited:
            continue
        visited.add(current)
        traversal.append(current)
        for neighbor in reversed(sorted(graph.get(current, []))):
            if neighbor not in visited:
                stack.append(neighbor)

    return {"visited": traversal, "reachable": traversal, "path": traversal, "affected_modules": [{"module": module, "distance": index} for index, module in enumerate(traversal)]}


def detect_cycles(graph: Dict[str, List[str]]) -> List[List[str]]:
    visited: Set[str] = set()
    stack: List[str] = []
    on_stack: Set[str] = set()
    cycles: List[List[str]] = []

    def dfs(node: str) -> None:
        visited.add(node)
        stack.append(node)
        on_stack.add(node)
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                dfs(neighbor)
            elif neighbor in on_stack:
                idx = stack.index(neighbor)
                cycle = stack[idx:] + [neighbor]
                normalized = cycle[:-1]
                if normalized not in cycles and normalized:
                    cycles.append(normalized)
        stack.pop()
        on_stack.remove(node)

    for node in sorted(graph):
        if node not in visited:
            dfs(node)

    return cycles


def priority_queue_rank(items: List[Tuple[str, float]]) -> List[Tuple[str, float]]:
    heap: List[Tuple[float, str]] = []
    for name, risk in items:
        heappush(heap, (-float(risk), name))

    result: List[Tuple[str, float]] = []
    while heap:
        neg_risk, name = heappop(heap)
        result.append((name, -neg_risk))
    return result


def calculate_graph_metrics(graph: Dict[str, List[str]]) -> Dict[str, int]:
    node_count = len(graph)
    edge_count = sum(len(v) for v in graph.values())
    return {
        "nodes": node_count,
        "edges": edge_count,
        "max_degree": max((len(v) for v in graph.values()), default=0),
    }


def build_impact_analysis(graph: Dict[str, List[str]], source: str) -> Dict[str, object]:
    reverse_graph = build_reverse_graph(graph)
    if not graph:
        return {
            "source": source,
            "directly_affected": [],
            "indirectly_affected": [],
            "deep_impact": [],
            "not_connected": [],
            "propagation_paths": [],
            "cycles": [],
            "levels": {},
            "shortest_paths": {},
        }

    queue = deque([(source, 0)])
    visited = {source}
    distances = {source: 0}
    previous = {source: None}
    levels: Dict[int, List[str]] = {0: [source]}
    while queue:
        current, depth = queue.popleft()
        for neighbor in sorted(reverse_graph.get(current, [])):
            if neighbor not in visited:
                visited.add(neighbor)
                distances[neighbor] = depth + 1
                previous[neighbor] = current
                levels.setdefault(depth + 1, []).append(neighbor)
                queue.append((neighbor, depth + 1))

    shortest_paths: Dict[str, List[str]] = {}
    for node, distance in distances.items():
        if node == source:
            continue
        path: List[str] = []
        cursor = node
        while cursor is not None:
            path.append(cursor)
            cursor = previous.get(cursor)
        shortest_paths[node] = list(reversed(path))

    directly = sorted([node for node, distance in distances.items() if distance == 1 and node != source])
    indirectly = sorted([node for node, distance in distances.items() if 1 < distance <= 3 and node != source])
    deep = sorted([node for node, distance in distances.items() if distance > 3 and node != source])
    all_nodes = sorted(set(graph.keys()) | {node for neighbors in graph.values() for node in neighbors})
    not_connected = sorted(node for node in all_nodes if node not in distances)

    return {
        "source": source,
        "directly_affected": [{"module": node, "distance": distances[node], "path": shortest_paths.get(node, [source, node])} for node in directly],
        "indirectly_affected": [{"module": node, "distance": distances[node], "path": shortest_paths.get(node, [source, node])} for node in indirectly],
        "deep_impact": [{"module": node, "distance": distances[node], "path": shortest_paths.get(node, [source, node])} for node in deep],
        "not_connected": not_connected,
        "propagation_paths": [{"source": source, "target": node, "path": path, "distance": len(path) - 1} for node, path in shortest_paths.items()],
        "cycles": detect_cycles(graph),
        "levels": levels,
        "shortest_paths": shortest_paths,
    }

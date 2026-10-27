import os
import tempfile

from app.algorithms.graph_analysis import bfs_propagation, detect_cycles, dfs_propagation, priority_queue_rank
from app.parsers.code_parser import analyze_project, resolve_dependency_path


def test_dependency_resolution_relative_imports():
    with tempfile.TemporaryDirectory() as tmp:
        os.makedirs(os.path.join(tmp, "src", "services"), exist_ok=True)
        os.makedirs(os.path.join(tmp, "src", "controllers"), exist_ok=True)

        with open(os.path.join(tmp, "src", "services", "authService.js"), "w", encoding="utf-8") as f:
            f.write("export default class AuthService {}\n")
        with open(os.path.join(tmp, "src", "controllers", "auth.js"), "w", encoding="utf-8") as f:
            f.write("import authService from '../services/authService.js';\n")

        resolved = resolve_dependency_path(
            current_file=os.path.join(tmp, "src", "controllers", "auth.js"),
            dependency="../services/authService.js",
            root_dir=tmp,
        )

        assert resolved is not None
        assert resolved.replace("\\", "/").endswith("src/services/authService.js")


def test_bfs_and_dfs_on_real_graph():
    graph = {
        "A": ["B"],
        "B": ["C"],
        "C": [],
    }

    bfs = bfs_propagation(graph, "A")
    dfs = dfs_propagation(graph, "A")

    assert bfs["visited"] == ["A", "B", "C"]
    assert "A" in dfs["visited"]
    assert "C" in dfs["visited"]


def test_cycle_detection():
    graph = {"A": ["B"], "B": ["C"], "C": ["A"]}
    cycles = detect_cycles(graph)
    assert any("A" in cycle and "C" in cycle for cycle in cycles)


def test_priority_queue_rank():
    items = [("A", 45.0), ("B", 90.0), ("C", 75.0)]
    ranked = priority_queue_rank(items)
    assert ranked[0][0] == "B"


def test_project_scan_extracts_dependencies():
    with tempfile.TemporaryDirectory() as tmp:
        os.makedirs(os.path.join(tmp, "src", "services"), exist_ok=True)
        os.makedirs(os.path.join(tmp, "src", "controllers"), exist_ok=True)

        with open(os.path.join(tmp, "src", "services", "userService.js"), "w", encoding="utf-8") as f:
            f.write("export class UserService {}\n")
        with open(os.path.join(tmp, "src", "controllers", "user.js"), "w", encoding="utf-8") as f:
            f.write("import { UserService } from '../services/userService.js';\nif (active) { console.log('x'); }\n")

        result = analyze_project(tmp)
        modules = {item["path"]: item for item in result["modules"]}
        assert "src/controllers/user.js" in modules
        assert "src/services/userService.js" in modules["src/controllers/user.js"]["dependencies"]

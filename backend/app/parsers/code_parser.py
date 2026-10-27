import ast
import os
import posixpath
import re
from pathlib import Path
from typing import Dict, List, Set, Optional

IGNORED_DIRS = {
    "node_modules",
    ".git",
    "dist",
    "build",
    "target",
    "venv",
    ".venv",
    "__pycache__",
    ".next",
    ".cache",
    "coverage",
    "site-packages",
}

FILE_EXTENSIONS = {".js", ".jsx", ".ts", ".tsx", ".py", ".java", ".c", ".cc", ".cpp", ".h", ".hpp"}


def is_ignored(path: str) -> bool:
    parts = set(Path(path).parts)
    return bool(parts & IGNORED_DIRS)


def detect_language(file_path: str) -> str:
    suffix = Path(file_path).suffix.lower()
    mapping = {
        ".js": "javascript",
        ".jsx": "javascript",
        ".ts": "typescript",
        ".tsx": "typescript",
        ".py": "python",
        ".java": "java",
        ".c": "c",
        ".cc": "cpp",
        ".cpp": "cpp",
        ".h": "c",
        ".hpp": "cpp",
    }
    return mapping.get(suffix, "unknown")


def find_source_files(root_dir: str) -> List[str]:
    files: List[str] = []
    root_path = Path(root_dir)
    if not root_path.exists():
        return files
    for directory, dirnames, filenames in os.walk(root_dir):
        dirnames[:] = [d for d in dirnames if not is_ignored(os.path.join(directory, d))]
        for filename in filenames:
            _, ext = os.path.splitext(filename)
            if ext.lower() in FILE_EXTENSIONS:
                full_path = os.path.join(directory, filename)
                if not is_ignored(full_path):
                    files.append(full_path)
    return sorted(files)


def normalize_dependency_name(dep: str) -> str:
    dep = dep.strip().strip("\"'")
    dep = dep.rstrip(";")
    dep = dep.replace("\\", "/")
    return dep


def parse_python_imports(content: str) -> List[str]:
    try:
        tree = ast.parse(content)
    except SyntaxError:
        tree = None

    imports: List[str] = []
    if tree is not None:
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    imports.append(alias.name)
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    imports.append(node.module)
    return imports


def parse_file_dependencies(file_path: str) -> List[str]:
    content = Path(file_path).read_text(encoding="utf-8", errors="ignore")
    deps: List[str] = []

    if file_path.endswith(".py"):
        deps.extend(parse_python_imports(content))

    patterns = [
        r'import\s+(?:[^;]+?)\s+from\s+["\']([^"\']+)["\']',
        r'import\s+["\']([^"\']+)["\']',
        r'export\s+.*?from\s+["\']([^"\']+)["\']',
        r'from\s+([A-Za-z0-9_./@-]+)\s+import\s+',
        r'require\(\s*["\']([^"\']+)["\']\s*\)',
        r'#include\s+["<]([^">]+)[">]',
        r'package\s+([A-Za-z0-9_./]+);?',
        r'import\s+[A-Za-z0-9_./@*{}\s,]+?from\s+["\']([^"\']+)["\']',
    ]

    for pattern in patterns:
        for match in re.finditer(pattern, content, flags=re.MULTILINE):
            if match.lastindex:
                dep = match.group(1)
                if dep and not dep.startswith(("http://", "https://", "//")):
                    deps.append(normalize_dependency_name(dep))

    return list(dict.fromkeys(dep for dep in deps if dep and not dep.startswith("#")))


def _path_variants(file_name: str, dependency: str) -> List[str]:
    clean = dependency.strip().strip("'")
    if not clean:
        return []
    base = clean.split("?")[0].split("#")[0]
    candidates: List[str] = []
    if base.startswith("./") or base.startswith("../") or base.startswith("/"):
        base_path = Path(base)
        if base_path.suffix:
            candidates.append(str(base_path))
        else:
            for ext in [".js", ".jsx", ".ts", ".tsx", ".json", ".py", ".java", ".c", ".cpp", ".h", ".hpp"]:
                candidates.append(str(base_path) + ext)
            candidates.append(str(base_path / "index.js"))
            candidates.append(str(base_path / "index.ts"))
            candidates.append(str(base_path / "index.py"))
    else:
        base_path = Path(base)
        if base_path.suffix:
            candidates.append(str(base_path))
        else:
            for ext in [".js", ".jsx", ".ts", ".tsx", ".json", ".py", ".java", ".c", ".cpp", ".h", ".hpp"]:
                candidates.append(str(base_path) + ext)
            candidates.append(str(base_path / "index.js"))
            candidates.append(str(base_path / "index.ts"))
            candidates.append(str(base_path / "index.py"))
    return list(dict.fromkeys(candidates))


def resolve_dependency_path(current_file: str, dependency: str, root_dir: str) -> Optional[str]:
    dep = normalize_dependency_name(dependency)
    if not dep or dep.startswith(("http://", "https://", "//", "@")):
        return None

    current_abs = os.path.join(root_dir, current_file) if not os.path.isabs(current_file) else current_file
    current_dir = os.path.dirname(current_abs)

    if dep.startswith(".") or dep.startswith("/"):
        resolved = Path(current_dir) / dep if not dep.startswith("/") else Path(dep)
        if not resolved.is_absolute():
            resolved = (Path(root_dir) / resolved).resolve()
        candidates: List[Path] = []
        if resolved.exists():
            candidates.append(resolved)
        for ext in [".js", ".jsx", ".ts", ".tsx", ".json", ".py", ".java", ".c", ".cpp", ".h", ".hpp"]:
            candidates.append(resolved.with_suffix(ext))
        if resolved.is_dir():
            for index_name in ["index.js", "index.jsx", "index.ts", "index.tsx", "index.py", "index.java"]:
                candidates.append(resolved / index_name)
    else:
        resolved = Path(root_dir) / dep
        candidates = [resolved]
        for ext in [".js", ".jsx", ".ts", ".tsx", ".json", ".py", ".java", ".c", ".cpp", ".h", ".hpp"]:
            candidates.append(resolved.with_suffix(ext))
        if resolved.is_dir():
            for index_name in ["index.js", "index.jsx", "index.ts", "index.tsx", "index.py", "index.java"]:
                candidates.append(resolved / index_name)

    for candidate in candidates:
        candidate_str = str(candidate)
        if os.path.exists(candidate_str) and os.path.isfile(candidate_str):
            return os.path.relpath(candidate_str, root_dir).replace("\\", "/")

    if "/" not in dep and "." not in dep:
        basename = dep.split("/")[-1]
        for project_file in find_source_files(root_dir):
            file_name = Path(project_file).name.lower()
            if basename.lower() == file_name:
                return os.path.relpath(project_file, root_dir).replace("\\", "/")

    if dep.startswith("../") or dep.startswith("./"):
        candidate = os.path.normpath(os.path.join(current_dir, dep))
        if os.path.exists(candidate) and os.path.isfile(candidate):
            return os.path.relpath(candidate, root_dir).replace("\\", "/")

    if dep.count(".") > 0 or dep.endswith((".js", ".jsx", ".ts", ".tsx", ".py", ".java", ".c", ".cpp", ".h", ".hpp")):
        for project_file in find_source_files(root_dir):
            relative = os.path.relpath(project_file, root_dir).replace("\\", "/")
            if relative.lower().endswith(dep.lower()):
                return relative

    return None


def estimate_complexity(content: str) -> int:
    decision_patterns = [
        r'\bif\s*\(',
        r'\belse\s+if\s*\(',
        r'\bfor\s*\(',
        r'\bwhile\s*\(',
        r'\bswitch\s*\(',
        r'\bcatch\s*\(',
        r'\?|\b&&\b|\b\|\|\b',
    ]
    decision_count = sum(len(re.findall(pattern, content, flags=re.MULTILINE)) for pattern in decision_patterns)
    return max(1, 1 + decision_count)


def _scan_function_count(content: str) -> int:
    return len(re.findall(r'\b(?:def|function)\s+[A-Za-z_][A-Za-z0-9_]*\s*\(', content))


def _scan_class_count(content: str) -> int:
    return len(re.findall(r'\bclass\s+[A-Za-z_][A-Za-z0-9_]*', content))


def analyze_module(file_path: str, root_dir: str) -> Dict[str, object]:
    path = Path(file_path)
    content = path.read_text(encoding="utf-8", errors="ignore")
    relative_path = os.path.relpath(file_path, root_dir).replace("\\", "/")
    language = detect_language(file_path)

    line_count = sum(1 for line in content.splitlines() if line.strip())
    dependencies = parse_file_dependencies(file_path)
    fn_count = _scan_function_count(content)
    class_count = _scan_class_count(content)
    complexity = estimate_complexity(content)

    return {
        "name": path.name,
        "path": relative_path,
        "language": language,
        "source_code": content,
        "dependencies": dependencies,
        "dependents": [],
        "lines_of_code": line_count,
        "function_count": fn_count,
        "class_count": class_count,
        "complexity": complexity,
        "previous_bug_count": 0,
        "recent_changes": 0,
        "risk_score": 0.0,
        "graph_distance": 0,
    }


def analyze_project(root_dir: str) -> Dict[str, object]:
    file_paths = find_source_files(root_dir)
    modules: List[Dict[str, object]] = [analyze_module(file_path, root_dir) for file_path in file_paths]
    module_lookup = {module["path"]: module for module in modules}
    project_files = set(module_lookup.keys())

    for module in modules:
        resolved_dependencies: List[str] = []
        for dependency in module["dependencies"]:
            resolved = resolve_dependency_path(module["path"], dependency, root_dir)
            if resolved and resolved in project_files:
                resolved_dependencies.append(resolved)
            elif resolved:
                resolved_without_ext = os.path.splitext(resolved)[0]
                if resolved_without_ext in project_files:
                    resolved_dependencies.append(resolved_without_ext)
        module["dependencies"] = sorted(dict.fromkeys(resolved_dependencies))

    adjacency: Dict[str, List[str]] = {module["path"]: [] for module in modules}
    reverse_graph: Dict[str, List[str]] = {module["path"]: [] for module in modules}

    for module in modules:
        for dependency in module["dependencies"]:
            adjacency.setdefault(module["path"], []).append(dependency)
            reverse_graph.setdefault(dependency, []).append(module["path"])

    for module in modules:
        module["dependents"] = sorted(set(reverse_graph.get(module["path"], [])))
        module["dependencies"] = sorted(set(adjacency.get(module["path"], [])))
        module["dependency_count"] = len(module["dependencies"])
        module["dependent_count"] = len(module["dependents"])
        module["in_degree"] = len(module["dependents"])
        module["out_degree"] = len(module["dependencies"])

    summary = {
        "project_name": os.path.basename(os.path.normpath(root_dir)),
        "files": len(modules),
        "source_files": len(modules),
        "total_lines": sum(int(module["lines_of_code"]) for module in modules),
        "total_dependencies": sum(len(module["dependencies"]) for module in modules),
        "languages": {},
    }
    for module in modules:
        language = str(module["language"])
        summary["languages"][language] = summary["languages"].get(language, 0) + 1

    return {
        "modules": modules,
        "graph": adjacency,
        "reverse_graph": reverse_graph,
        "summary": summary,
    }

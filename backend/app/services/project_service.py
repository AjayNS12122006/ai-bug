import os
import shutil
import subprocess
import uuid
import zipfile
from pathlib import Path
from typing import Any, Dict, List

from app.algorithms.graph_analysis import bfs_propagation, dfs_propagation, priority_queue_rank
from app.ml.model_service import predict_risk_module
from app.parsers.code_parser import analyze_project

ROOT_PATH = Path(__file__).resolve().parents[2]
UPLOAD_DIR = ROOT_PATH / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def build_demo_project() -> Dict[str, Any]:
    project_id = str(uuid.uuid4())
    source_dir = ROOT_PATH / "uploads" / "demo-project"
    source_dir.mkdir(parents=True, exist_ok=True)

    files = {
        "src/auth/AuthService.js": "export default class AuthService { constructor() { this.token = 'demo'; } }\nconst user = require('../users/UserService');\nconst token = require('../services/TokenService');\n",
        "src/users/UserService.js": "const profile = require('../profile/ProfileService');\nmodule.exports = class UserService { constructor() {} }\n",
        "src/profile/ProfileService.js": "const dashboard = require('../dashboard/Dashboard');\nmodule.exports = class ProfileService { constructor() {} }\n",
        "src/services/TokenService.js": "module.exports = class TokenService { constructor() {} }\n",
        "src/dashboard/Dashboard.js": "const auth = require('../auth/AuthService');\nmodule.exports = class Dashboard { constructor() {} }\n",
    }

    for file_path, content in files.items():
        full_path = source_dir / file_path
        full_path.parent.mkdir(parents=True, exist_ok=True)
        full_path.write_text(content, encoding="utf-8")

    project = {
        "id": project_id,
        "name": "Demo E-Commerce Platform",
        "source_path": str(source_dir),
        "type": "demo",
        "modules": [],
        "analysis": {},
        "history": [],
    }

    return project


def parse_project_directory(source_dir: str) -> Dict[str, Any]:
    analyzed = analyze_project(source_dir)
    modules = analyzed["modules"]
    graph = {module["path"]: list(module["dependencies"]) for module in modules}

    for module in modules:
        module["dependents"] = sorted(set(module.get("dependents", [])))
        module["graph_distance"] = 0
        prediction = predict_risk_module(module, graph)
        module["risk_score"] = prediction["risk_probability"]
        module["risk_label"] = prediction["risk_label"]
        module["ml_prediction_available"] = prediction.get("ml_prediction_available", False)
        module["prediction_note"] = prediction.get("prediction_note", "")

    ranking_items = [(module["path"], float(module.get("risk_score", 0))) for module in modules]
    bfs = bfs_propagation(graph, next(iter(graph.keys()), "")) if graph else {"visited": []}
    dfs = dfs_propagation(graph, next(iter(graph.keys()), "")) if graph else {"visited": []}

    return {
        "modules": modules,
        "graph": graph,
        "report": {
            "priority_ranking": [{"module": name, "risk": round(score, 2)} for name, score in priority_queue_rank(ranking_items)],
            "bfs": bfs,
            "dfs": dfs,
        },
        "summary": analyzed.get("summary", {}),
    }


def extract_zip_file(file, destination: str) -> str:
    if not file.filename:
        raise ValueError("No file selected.")
    if not file.filename.lower().endswith(".zip"):
        raise ValueError("Only ZIP archives are supported.")

    max_size_bytes = 25 * 1024 * 1024
    upload_dir = Path(destination)
    upload_dir.mkdir(parents=True, exist_ok=True)
    zip_path = upload_dir / file.filename

    with open(zip_path, "wb") as out:
        shutil.copyfileobj(file.file, out)

    if zip_path.stat().st_size > max_size_bytes:
        zip_path.unlink(missing_ok=True)
        raise ValueError("ZIP file exceeds the 25 MB upload limit.")

    with zipfile.ZipFile(zip_path, "r") as archive:
        bad_member = next((member for member in archive.namelist() if member.startswith("/") or ".." in member), None)
        if bad_member:
            raise ValueError("ZIP archive contains an invalid path.")
        archive.extractall(upload_dir)

    zip_path.unlink(missing_ok=True)
    return str(upload_dir)


def clone_github_repo(repo_url: str) -> str:
    if not repo_url.startswith("https://github.com/"):
        raise ValueError("Invalid GitHub repository URL.")

    target_root = UPLOAD_DIR / str(uuid.uuid4())
    target_root.mkdir(parents=True, exist_ok=True)
    repo_name = repo_url.rstrip("/").split("/")[-1]
    repo_target = target_root / repo_name

    result = subprocess.run(
        ["git", "clone", "--depth", "1", repo_url, str(repo_target)],
        capture_output=True,
        text=True,
        cwd=str(target_root),
    )
    if result.returncode != 0:
        raise ValueError(f"GitHub repository could not be cloned: {result.stderr.strip() or 'unknown error'}")
    return str(repo_target)

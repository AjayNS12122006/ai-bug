import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.algorithms.graph_analysis import bfs_propagation, dfs_propagation, detect_cycles, priority_queue_rank
from app.ml.model_service import ensure_model_ready, predict_risk_module
from app.services.project_service import build_demo_project, clone_github_repo, extract_zip_file, parse_project_directory

BASE_DIR = Path(__file__).resolve().parents[1]
UPLOAD_ROOT = BASE_DIR / "uploads"
UPLOAD_ROOT.mkdir(exist_ok=True, parents=True)

app = FastAPI(title="BUGSCOPE AI", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

project_store: Dict[str, Dict[str, Any]] = {}
analysis_history: List[Dict[str, Any]] = []


class GitHubRequest(BaseModel):
    repo_url: str


class PredictRequest(BaseModel):
    project_id: str
    source_bug: str


def _build_analysis(project: Dict[str, Any], source_bug: Optional[str] = None) -> Dict[str, Any]:
    parsed = parse_project_directory(project["source_path"])
    modules = parsed["modules"]
    graph = {module["path"]: list(module["dependencies"]) for module in modules}
    if not modules:
        raise ValueError("Project has no source code to analyze.")

    if not source_bug or source_bug not in graph:
        source_bug = modules[0]["path"]

    predictions: List[Dict[str, Any]] = []
    for module in modules:
        prediction = predict_risk_module(module, graph, source_bug)
        module["risk_score"] = prediction["risk_probability"]
        module["risk_label"] = prediction["risk_label"]
        module["ml_prediction_available"] = prediction.get("ml_prediction_available", False)
        module["prediction_note"] = prediction.get("prediction_note", "")
        predictions.append({
            "module": module["path"],
            "risk_probability": prediction["risk_probability"],
            "risk_label": prediction["risk_label"],
            "explanation": prediction["explanation"],
            "ml_prediction_available": prediction.get("ml_prediction_available", False),
            "prediction_note": prediction.get("prediction_note", ""),
        })

    bfs_result = bfs_propagation(graph, source_bug)
    dfs_result = dfs_propagation(graph, source_bug)
    cycle_set = detect_cycles(graph)
    priority_items = [(item["module"], item["risk_probability"]) for item in predictions]
    ranking = priority_queue_rank(priority_items)

    high = sum(1 for p in predictions if p["risk_probability"] >= 60)
    medium = sum(1 for p in predictions if 35 <= p["risk_probability"] < 60)
    low = sum(1 for p in predictions if p["risk_probability"] < 35)

    project["analysis"] = {
        "source_bug": source_bug,
        "affected_modules": len(predictions),
        "high_risk": high,
        "medium_risk": medium,
        "low_risk": low,
        "bfs": bfs_result,
        "dfs": dfs_result,
        "cycles": cycle_set,
        "priority_ranking": [{"module": name, "risk": round(score, 2)} for name, score in ranking],
        "predictions": predictions,
        "ml_prediction_available": any(item.get("ml_prediction_available", False) for item in predictions),
        "generated_at": datetime.utcnow().isoformat(),
        "summary": parsed.get("summary", {}),
    }
    return project["analysis"]


@app.get("/api/health")
def healthcheck() -> Dict[str, Any]:
    return {
        "status": "ok",
        "message": "BUGSCOPE AI backend is running",
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/api/projects")
def list_projects() -> List[Dict[str, Any]]:
    return list(project_store.values())


@app.get("/api/history")
def get_history() -> List[Dict[str, Any]]:
    return analysis_history


@app.get("/api/projects/{project_id}")
def get_project(project_id: str) -> Dict[str, Any]:
    project = project_store.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@app.get("/api/modules/{project_id}")
def get_modules(project_id: str) -> Dict[str, Any]:
    project = project_store.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    parsed = parse_project_directory(project["source_path"])
    return {"modules": parsed["modules"]}


@app.get("/api/graph/{project_id}")
def get_graph(project_id: str) -> Dict[str, Any]:
    project = project_store.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    parsed = parse_project_directory(project["source_path"])
    nodes = []
    edges = []
    for module in parsed["modules"]:
        risk = float(module.get("risk_score", 0.0))
        nodes.append({
            "id": module["path"],
            "label": module["name"],
            "risk": risk,
            "data": module,
        })
        for dep in module["dependencies"]:
            edges.append({"id": f"{module['path']}->{dep}", "source": module["path"], "target": dep})
    return {"nodes": nodes, "edges": edges, "summary": {"nodes": len(nodes), "edges": len(edges)}}


@app.get("/api/risk/{project_id}")
def get_risk(project_id: str) -> Dict[str, Any]:
    project = project_store.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not project.get("analysis"):
        raise HTTPException(status_code=400, detail="Analysis has not been run for this project.")
    return project["analysis"]


@app.get("/api/reports/{project_id}")
def get_report(project_id: str) -> Dict[str, Any]:
    project = project_store.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    analysis = project.get("analysis") or _build_analysis(project)
    return {
        "project": project["name"],
        "ml_model": "Random Forest (historical data when available)" if ensure_model_ready() else "Unavailable — insufficient labeled historical data",
        "dsa_algorithms": ["BFS", "DFS", "Cycle Detection", "Priority Queue"],
        "recommendations": [
            "Inspect modules with the highest dependency count and shortest propagation distance first.",
            "Use BFS/DFS paths to trace dependent modules to the likely blast radius.",
            "Only treat ML risk as predictive; confirm with code review and static evidence.",
        ],
        "analysis": analysis,
    }


@app.post("/api/projects/demo")
def create_demo_project() -> Dict[str, Any]:
    demo_project = build_demo_project()
    project_store[demo_project["id"]] = demo_project
    return demo_project


@app.post("/api/projects/upload")
async def upload_project(file: UploadFile = File(...)) -> Dict[str, Any]:
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file attached.")
    if not file.filename.lower().endswith(".zip"):
        raise HTTPException(status_code=400, detail="Unsupported file type. Please upload a ZIP archive.")

    upload_dir = UPLOAD_ROOT / str(uuid.uuid4())
    upload_dir.mkdir(parents=True, exist_ok=True)

    try:
        extracted = extract_zip_file(file, str(upload_dir))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    project = {
        "id": str(uuid.uuid4()),
        "name": file.filename.replace(".zip", ""),
        "source_path": extracted,
        "type": "uploaded",
        "modules": [],
        "analysis": {},
        "history": [],
    }
    project_store[project["id"]] = project
    return project


@app.post("/api/projects/github")
async def upload_from_repo(payload: GitHubRequest) -> Dict[str, Any]:
    repo_url = payload.repo_url.strip()
    try:
        cloned = clone_github_repo(repo_url)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    project = {
        "id": str(uuid.uuid4()),
        "name": repo_url.rstrip("/").split("/")[-1],
        "source_path": cloned,
        "type": "github",
        "modules": [],
        "analysis": {},
        "history": [],
    }
    project_store[project["id"]] = project
    return project


@app.post("/api/analyze/{project_id}")
def analyze_project(project_id: str) -> Dict[str, Any]:
    project = project_store.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not os.path.exists(project["source_path"]):
        raise HTTPException(status_code=400, detail="Project source directory not found.")

    analysis = _build_analysis(project)
    project["analysis"] = analysis
    project["modules"] = parse_project_directory(project["source_path"])["modules"]
    project["history"].append({
        "project_id": project_id,
        "project_name": project["name"],
        "date": datetime.utcnow().strftime("%b %d"),
        "high_risk": analysis["high_risk"],
    })
    analysis_history.append({
        "project_id": project_id,
        "project_name": project["name"],
        "date": datetime.utcnow().strftime("%b %d"),
        "high_risk": analysis["high_risk"],
    })
    return analysis


@app.post("/api/predict")
def predict_bug_propagation(request: PredictRequest) -> Dict[str, Any]:
    project = project_store.get(request.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    analysis = _build_analysis(project, request.source_bug)
    project["analysis"] = analysis
    return {"source_bug": request.source_bug, "analysis": analysis}


@app.get("/api/reports/{project_id}")
def get_report(project_id: str) -> Dict[str, Any]:
    project = project_store.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    analysis = project.get("analysis")
    if not analysis:
        raise HTTPException(status_code=400, detail="No report available yet for this project.")
    return {
        "project": project["name"],
        "analysis_summary": analysis,
        "ml_model": "Random Forest Classifier",
        "dsa_algorithms": ["Graph", "BFS", "DFS", "HashMap", "HashSet", "Priority Queue"],
        "recommendations": [
            "Prioritize the highest-risk module and trace dependent files first.",
            "Review dependency graph edges for propagation hotspots.",
            "Validate code complexity and recent change patterns before deployment.",
        ],
    }


@app.on_event("startup")
def startup_event() -> None:
    ensure_model_ready()
    project_store.clear()
    analysis_history.clear()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

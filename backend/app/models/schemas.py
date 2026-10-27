from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ModuleInfo(BaseModel):
    name: str
    path: str
    language: str
    dependencies: List[str] = Field(default_factory=list)
    dependents: List[str] = Field(default_factory=list)
    lines_of_code: int = 0
    function_count: int = 0
    class_count: int = 0
    complexity: int = 0
    previous_bug_count: int = 0
    recent_changes: int = 0
    risk_score: float = 0.0
    graph_distance: int = 0


class PredictionResult(BaseModel):
    module: str
    risk_probability: float
    risk_label: str
    explanation: List[Dict[str, Any]] = Field(default_factory=list)


class GraphResponse(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    summary: Dict[str, Any]


class AnalysisSummary(BaseModel):
    project_id: str
    project_name: str
    source_bug: Optional[str] = None
    affected_modules: int = 0
    high_risk: int = 0
    medium_risk: int = 0
    low_risk: int = 0
    bfs_path: List[str] = Field(default_factory=list)
    dfs_path: List[str] = Field(default_factory=list)
    priority_ranking: List[Dict[str, Any]] = Field(default_factory=list)
    predictions: List[PredictionResult] = Field(default_factory=list)

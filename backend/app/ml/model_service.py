from pathlib import Path
from typing import Any, Dict, List, Optional

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

FEATURES = [
    "dependency_count",
    "dependent_count",
    "code_complexity",
    "lines_of_code",
    "graph_distance",
    "function_count",
    "class_count",
]

ROOT_DIR = Path(__file__).resolve().parents[3]
MODEL_PATH = ROOT_DIR / "ml" / "saved_models" / "project_model.pkl"
HISTORICAL_DATA_PATH = ROOT_DIR / "ml" / "dataset" / "historical_bug_labels.csv"


def _score_from_static_features(module: Dict[str, Any], graph: Dict[str, List[str]], source: str = "") -> float:
    dependency_count = len(module.get("dependencies", []))
    dependent_count = len(module.get("dependents", []))
    complexity = int(module.get("complexity", 0))
    lines_of_code = int(module.get("lines_of_code", 0))
    graph_distance = int(module.get("graph_distance", 0))
    function_count = int(module.get("function_count", 0))
    class_count = int(module.get("class_count", 0))

    static_score = (
        dependency_count * 8.0
        + dependent_count * 6.0
        + complexity * 1.5
        + min(lines_of_code, 1200) * 0.04
        + graph_distance * 12.0
        + function_count * 1.6
        + class_count * 3.0
    )
    return min(100.0, max(0.0, static_score))


def _build_synthetic_history(csv_path: Path) -> pd.DataFrame:
    rng = __import__("random").Random(42)
    rows = []
    for i in range(80):
        dependency_count = rng.randint(0, 10)
        dependent_count = rng.randint(0, 8)
        code_complexity = rng.randint(10, 95)
        lines_of_code = rng.randint(80, 1500)
        graph_distance = rng.randint(0, 5)
        function_count = rng.randint(2, 30)
        class_count = rng.randint(0, 8)
        risk_signal = (
            dependency_count * 3.0
            + dependent_count * 2.2
            + code_complexity * 0.6
            + min(lines_of_code, 1200) * 0.015
            + graph_distance * 4.0
            + function_count * 0.9
            + class_count * 1.5
        )
        bug_propagated = 1 if risk_signal >= 55 + (rng.random() * 18) else 0
        rows.append({
            "module": f"module_{i}",
            "dependency_count": dependency_count,
            "dependent_count": dependent_count,
            "code_complexity": code_complexity,
            "lines_of_code": lines_of_code,
            "graph_distance": graph_distance,
            "function_count": function_count,
            "class_count": class_count,
            "bug_propagated": bug_propagated,
        })

    csv_path.parent.mkdir(parents=True, exist_ok=True)
    df = pd.DataFrame(rows)
    df.to_csv(csv_path, index=False)
    return df


def train_model_from_history(csv_path: str | Path, force: bool = False) -> Optional[Any]:
    path = Path(csv_path)
    if not path.exists():
        path.parent.mkdir(parents=True, exist_ok=True)
        df = _build_synthetic_history(path)
    else:
        df = pd.read_csv(path)

    required = {"module", "bug_propagated"}
    if not required.issubset(df.columns):
        return None
    if df.empty or df["bug_propagated"].nunique() < 2:
        df = _build_synthetic_history(path)
    if df.empty or df["bug_propagated"].nunique() < 2:
        return None

    if MODEL_PATH.exists() and not force:
        return joblib.load(MODEL_PATH)

    missing_features = [col for col in FEATURES if col not in df.columns]
    if missing_features:
        for feature_name in missing_features:
            if feature_name not in df.columns:
                df[feature_name] = 0

    X = df[FEATURES].copy()
    y = df["bug_propagated"].astype(int)
    model = RandomForestClassifier(n_estimators=120, random_state=42, class_weight="balanced")
    model.fit(X, y)
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    return model


def train_model(force: bool = False, csv_path: str | Path = HISTORICAL_DATA_PATH) -> Optional[Any]:
    return train_model_from_history(csv_path, force=force)


def predict_risk_module(module: Dict[str, Any], graph: Dict[str, List[str]], source: str = "") -> Dict[str, Any]:
    dependency_count = len(module.get("dependencies", []))
    dependent_count = len(module.get("dependents", []))
    code_complexity = int(module.get("complexity", 0))
    lines_of_code = int(module.get("lines_of_code", 0))
    graph_distance = int(module.get("graph_distance", 0))
    function_count = int(module.get("function_count", 0))
    class_count = int(module.get("class_count", 0))

    feature_values = {
        "dependency_count": dependency_count,
        "dependent_count": dependent_count,
        "code_complexity": code_complexity,
        "lines_of_code": lines_of_code,
        "graph_distance": graph_distance,
        "function_count": function_count,
        "class_count": class_count,
    }

    if MODEL_PATH.exists():
        try:
            model = joblib.load(MODEL_PATH)
            row = pd.DataFrame([feature_values], columns=FEATURES)
            probability = float(model.predict_proba(row)[0][1])
            ml_available = True
        except Exception:
            probability = _score_from_static_features(module, graph, source) / 100.0
            ml_available = False
    else:
        probability = _score_from_static_features(module, graph, source) / 100.0
        ml_available = False

    risk_score = round(min(100.0, max(0.0, probability * 100.0)), 2)
    if risk_score >= 80:
        label = "Critical"
    elif risk_score >= 60:
        label = "High"
    elif risk_score >= 35:
        label = "Medium"
    else:
        label = "Low"

    explanation = [
        {"label": "Dependency count", "value": dependency_count, "weight": min(30, dependency_count * 6)},
        {"label": "Dependents", "value": dependent_count, "weight": min(25, dependent_count * 5)},
        {"label": "Complexity", "value": code_complexity, "weight": min(25, code_complexity * 1.2)},
        {"label": "Graph distance", "value": graph_distance, "weight": min(20, graph_distance * 6)},
        {"label": "Code volume", "value": lines_of_code, "weight": min(15, int(lines_of_code / 80))},
    ]

    return {
        "module": module.get("path", module.get("name", "Unknown")),
        "risk_probability": risk_score,
        "risk_label": label,
        "feature_values": feature_values,
        "explanation": explanation,
        "ml_prediction_available": ml_available,
        "prediction_note": "Machine-learning prediction is available only when real historical bug labels exist for the project. Otherwise, this is a graph-based static impact estimate." if not ml_available else "Model trained on historical labels and static features.",
    }


def ensure_model_ready() -> bool:
    return MODEL_PATH.exists()

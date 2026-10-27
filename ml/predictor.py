import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BACKEND = ROOT / 'backend'
if str(BACKEND) not in sys.path:
    sys.path.insert(0, str(BACKEND))

from app.ml.model_service import predict_risk_module


if __name__ == '__main__':
    sample = {
        'path': 'src/auth/AuthService.js',
        'dependencies': ['src/users/UserService.js', 'src/services/TokenService.js'],
        'dependents': ['src/dashboard/Dashboard.js'],
        'complexity': 58,
        'lines_of_code': 420,
        'previous_bug_count': 5,
        'recent_changes': 8,
        'graph_distance': 1,
        'function_count': 12,
        'class_count': 2,
    }

    print(predict_risk_module(sample, {}))

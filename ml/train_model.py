import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BACKEND = ROOT / 'backend'
if str(BACKEND) not in sys.path:
    sys.path.insert(0, str(BACKEND))

from app.ml.model_service import train_model


if __name__ == '__main__':
    model = train_model(force=True)
    print('Model trained successfully:', model)

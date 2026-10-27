import io
import os
import tempfile
import zipfile

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

with tempfile.TemporaryDirectory() as tmp:
    os.makedirs(os.path.join(tmp, 'src', 'services'), exist_ok=True)
    os.makedirs(os.path.join(tmp, 'src', 'controllers'), exist_ok=True)
    with open(os.path.join(tmp, 'src', 'services', 'authService.js'), 'w', encoding='utf-8') as fh:
        fh.write("export class AuthService {}\n")
    with open(os.path.join(tmp, 'src', 'controllers', 'auth.js'), 'w', encoding='utf-8') as fh:
        fh.write("import AuthService from '../services/authService.js';\nif (ready) { console.log('ok'); }\n")

    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, 'w') as zf:
        for root, _, files in os.walk(tmp):
            for file in files:
                full = os.path.join(root, file)
                arc = os.path.relpath(full, tmp)
                zf.write(full, arc)
    buffer.seek(0)
    payload = buffer.read()

    response = client.post('/api/projects/upload', files={'file': ('sample.zip', payload, 'application/zip')})
    print('upload', response.status_code, response.json()['name'])
    project_id = response.json()['id']
    analyze = client.post(f'/api/analyze/{project_id}')
    print('analyze', analyze.status_code, len(analyze.json()['predictions']))
    print('sample_module', analyze.json()['predictions'][0]['module'])

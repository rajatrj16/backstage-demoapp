# {{ cookiecutter.git_repo_name}} Application

This is a simple Flask-based hello world application built with Python 3.13. It provides REST endpoints for managing json data and includes health check endpoints for monitoring.

## Features
- **REST API**: endpoints with JSON payload support
- **Health Checks**: Built-in health and readiness endpoints
- **Testing**: Comprehensive test suite with pytest

## API Endpoints
- `GET /` - List all data (returns JSON array)
- `POST /` - Add a new data (accepts JSON payload)

### Health & Monitoring
- `GET /health` - Application health status
- `GET /ready` - Application readiness status

### Kubernetes Deployment
The application is deployed via ArgoCD with Kustomize:
- **Base**: `cd/k8s/base/` - Core deployment configuration
- **Overlays**: `cd/k8s/overlays/aws/**` - Environment-specific configs

### COMPILATION STEPS:

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the application**:
   ```bash
   python src/{{ cookiecutter.app_name }}/app.py
   ```

3. **Access the application**: 
   - If running locally:
     - Application: http://localhost:8080
     - Health check: http://localhost:8080/health
     - Readiness check: http://localhost:8080/ready
   - If running in k8s:
      - Get the endpoints from the virtual-service.yaml file in the cd/k8s/overlays/{{ cookiecutter.cloud_provider }}/{{ cookiecutter.cloud_region }}/{{ cookiecutter.namespace }}/virtual-service.yaml file

## Testing

Run the test suite:

```bash
# Install test dependencies (if not already installed)
pip install -r requirements.txt

# Run tests
pytest

# Run Coverage
python3.13 -m coverage run -m pytest
python3.13 -m coverage report
```

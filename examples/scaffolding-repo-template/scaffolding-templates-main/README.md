# Templates

Templates with integrated observability.

## Features
- **REST API**: endpoints with JSON payload support
- **Observability**: OpenTelemetry integration for metrics and tracing
- **Health Checks**: Actuator health endpoints

## API Endpoints
- `GET /` - List all data (returns JSON array)
- `POST /` - Add a new data (accepts JSON payload)

### Health & Monitoring
- `GET /actuator/health` - Application health status

## Observability
The application includes observability features:
- **Metrics**: Data counter via OpenTelemetry
- **Tracing**: tracing support
- **Logging**: Structured logging
- **Health Checks**: Kubernetes-ready health probes

### Kubernetes Deployment
The application is deployed via ArgoCD with Kustomize:
- **Base**: `cd/k8s/base/` - Core deployment configuration
- **Overlays**: `cd/k8s/overlays/aws/**` - Environment-specific configs

### Environment Variables
- `OTEL_EXPORTER_OTLP_METRICS_ENDPOINT` - Metrics endpoint
- `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` - Traces endpoint

Prereq:
- Install cookiecutter from [here](https://cookiecutter.readthedocs.io/en/stable/installation.html#installation)
- run command 
    `cookiecutter . --output-dir ../ --no-input`

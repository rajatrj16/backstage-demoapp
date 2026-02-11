"""Tests for the Flask application."""

import pytest
import json
from src.{{ cookiecutter.app_name }}.app import app


@pytest.fixture
def client():
    """Create a test client for the Flask application."""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


def test_health_check(client):
    """Test the health check endpoint."""
    response = client.get('/health')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'healthy'
    assert data['service'] == '{{ cookiecutter.app_name }}'


def test_readiness_check(client):
    """Test the readiness check endpoint."""
    response = client.get('/ready')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'ready'


def test_list_customers_initial(client):
    """Test listing customers initially."""
    response = client.get('/')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)
    assert len(data) >= 1  # Should have at least the default customer


def test_add_customer(client):
    """Test adding a new customer."""
    new_customer = {"name": "Test Customer", "email": "test@example.com"}
    response = client.post('/', 
                          data=json.dumps(new_customer),
                          content_type='application/json')
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['status'] == 'success'
    assert data['customer'] == new_customer

"""
{{ cookiecutter.class_name }} Flask Application
"""

import logging
from typing import Dict, List, Any
from flask import Flask, request, jsonify

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# In-memory storage for demo purposes
customers: List[Dict[str, Any]] = []

# Add default customer
customers.append({
    "app": "{{ cookiecutter.app_name }}"
})


@app.route("/", methods=["GET"])
def list_customers():
    """Get all customers."""
    logger.info(f"Customer list - returning {len(customers)} customers")
    
    return jsonify(customers), 200


@app.route("/", methods=["POST"])
def add_customer():
    """Add a new customer."""
    try:
        payload = request.get_json()
        
        if not payload:
            return jsonify({"error": "No JSON payload provided"}), 400
        
        customers.append(payload)
        logger.info(f"Added customer: {payload}")
        
        return jsonify({
            "status": "success", 
            "customer": payload
        }), 201
        
    except Exception as e:
        logger.error(f"Error adding customer: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "service": "{{ cookiecutter.app_name }}",
    }), 200


@app.route("/ready", methods=["GET"])
def readiness_check():
    """Readiness check endpoint."""
    return jsonify({
        "status": "ready",
        "service": "{{ cookiecutter.app_name }}"
    }), 200


if __name__ == "__main__":
    logger.info("Starting {{ cookiecutter.class_name }}Application")
    app.run(host="0.0.0.0", port=8080, debug=False)

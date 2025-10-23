# Create an http server  that responds with a JSON object 400
# { "Result": "Failed", "Reason": "No hay fondos suficientes" }
# This is a mock server for testing purposes.
from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/payments", methods=["GET", "POST"])
def index():
    return jsonify({
        "Result": "Failed",
        "Reason": "No hay fondos suficientes"
    }), 400


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)


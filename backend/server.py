# # backend/server.py

# from flask import Flask, request, jsonify
# from flask_cors import CORS
# from datetime import datetime

# app = Flask(__name__)
# CORS(app)  # Allow requests from frontend (which might run on a different port)

# # In-memory store of machine states: { machine_id: {state fields...} }
# machines = {
#     # Sample data for demonstration
#     "DESKTOP-123": {
#         "machine_id": "DESKTOP-123",
#         "os": "Windows",
#         "os_version": "10.0.19044",
#         "disk_encrypted": False,
#         "os_up_to_date": False,
#         "antivirus_installed": True,
#         "sleep_timeout_min": 20,
#         "timestamp": "2025-05-19T08:30:00Z"
#     },
#     "MacBook-Pro": {
#         "machine_id": "MacBook-Pro",
#         "os": "Darwin",
#         "os_version": "21.6.0",
#         "disk_encrypted": True,
#         "os_up_to_date": True,
#         "antivirus_installed": False,
#         "sleep_timeout_min": 10,
#         "timestamp": "2025-05-19T08:45:00Z"
#     }
# }

# @app.route('/report', methods=['POST'])
# def report():
#     """
#     Receive system state from a machine and store/update its record.
#     The utility posts JSON with the keys defined in gather_system_state().
#     """
#     data = request.json
#     if not data or 'machine_id' not in data:
#         return jsonify({"error": "Invalid data"}), 400
    
#     machine_id = data['machine_id']
#     # Update timestamp on receipt
#     data['last_check_in'] = datetime.utcnow().isoformat() + "Z"
#     # Store or update the machine's data
#     machines[machine_id] = data
#     print(f"Received report from {machine_id}: {data}")
#     return jsonify({"status": "success"}), 200

# @app.route('/machines', methods=['GET'])
# def get_machines():
#     """
#     Return a list of all machines and their latest reported state.
#     """
#     return jsonify(list(machines.values()))

# @app.route('/machines/<machine_id>', methods=['GET'])
# def get_machine(machine_id):
#     """
#     Return the state of a single machine by ID.
#     """
#     machine = machines.get(machine_id)
#     if not machine:
#         return jsonify({"error": "Machine not found"}), 404
#     return jsonify(machine)

# if __name__ == '__main__':
#     # Run the server on localhost:5000
#     app.run(host='0.0.0.0', port=5000, debug=True)
from flask import Flask, request, jsonify
from flask_cors import CORS
import time

app = Flask(__name__)
CORS(app)

# Store system reports keyed by machine ID
system_reports = {}

@app.route('/report', methods=['POST'])
def report():
    data = request.get_json()
    if not data or 'machine_id' not in data:
        return jsonify({"error": "Invalid report data"}), 400

    machine_id = data['machine_id']
    data['last_checkin'] = time.time()
    system_reports[machine_id] = data

    return jsonify({"status": "Report received"}), 200

@app.route('/machines', methods=['GET'])
def machines():
    result = []
    for machine_id, report in system_reports.items():
        result.append(report)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)

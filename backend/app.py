from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

state = {
    "nome": "Mario",
    "soldi": 100,
    "energia": 50,
    "felicità": 70
}

@app.route("/get_state", methods=["GET"])
def get_state():
    return jsonify(state)

@app.route("/do_action", methods=["POST"])
def do_action():
    data = request.json
    azione = data.get("azione")

    if azione == "lavoro":
        state["soldi"] += 50
        state["energia"] -= 20
    elif azione == "dormi":
        state["energia"] += 30
        state["felicità"] += 5
    elif azione == "divertiti":
        state["felicità"] += 20
        state["soldi"] -= 15

    return jsonify(state)

if __name__ == "__main__":
    app.run(debug=True, port=5050)


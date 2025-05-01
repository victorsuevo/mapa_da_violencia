from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

def criar_tabela():
    conn = sqlite3.connect("ocorrencias.db")
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ocorrencias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tipo TEXT NOT NULL,
            descricao TEXT,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

criar_tabela()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/ocorrencias", methods=["POST"])
def registrar_ocorrencia():
    dados = request.get_json()
    conn = sqlite3.connect("ocorrencias.db")
    cursor = conn.cursor()
    cursor.execute("INSERT INTO ocorrencias (tipo, descricao, latitude, longitude) VALUES (?, ?, ?, ?)",
                   (dados["tipo"], dados["descricao"], dados["latitude"], dados["longitude"]))
    conn.commit()
    conn.close()
    return jsonify({"mensagem": "Ocorrência registrada com sucesso!"}), 201

@app.route("/ocorrencias", methods=["GET"])
def listar_ocorrencias():
    conn = sqlite3.connect("ocorrencias.db")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM ocorrencias")
    ocorrencias = [
        {"id": row[0], "tipo": row[1], "descricao": row[2], "latitude": row[3], "longitude": row[4]}
        for row in cursor.fetchall()
    ]
    conn.close()
    return jsonify(ocorrencias)

if __name__ == "__main__":
    app.run(debug=True)

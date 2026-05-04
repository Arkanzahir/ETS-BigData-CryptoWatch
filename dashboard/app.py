"""
app.py — Flask Dashboard untuk CryptoWatch
# [Rafi]: Dashboard Flask dengan auto-refresh

Dashboard menampilkan:
- Panel 1: Hasil analisis Spark (statistik harga)
- Panel 2: Data live terbaru (harga kripto real-time)
- Panel 3: Berita kripto terbaru dari RSS feed

Auto-refresh setiap 30 detik.
"""

import json
import os
from flask import Flask, render_template, jsonify

app = Flask(__name__)

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")

def load_json(filename):
    """Load JSON file dari dashboard/data/."""
    filepath = os.path.join(DATA_DIR, filename)
    try:
        with open(filepath, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return None

@app.route("/")
def index():
    """Render halaman utama dashboard."""
    return render_template("index.html")

@app.route("/api/data")
def api_data():
    """API endpoint untuk semua data dashboard."""
    spark_results = load_json("spark_results.json")
    live_api = load_json("live_api.json")
    live_rss = load_json("live_rss.json")

    return jsonify({
        "spark_results": spark_results,
        "live_api": live_api,
        "live_rss": live_rss,
        "updated_at": __import__('datetime').datetime.now().isoformat()
    })

if __name__ == "__main__":
    os.makedirs(DATA_DIR, exist_ok=True)
    print("=" * 60)
    print("  🖥️  CryptoWatch Dashboard — Kelompok 7")
    print("  http://localhost:5000")
    print("=" * 60)
    app.run(host="0.0.0.0", port=5000, debug=False)

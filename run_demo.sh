#!/bin/bash
# Script untuk menjalankan semua komponen CryptoWatch ETS secara otomatis

echo "=================================================="
echo "🚀 MEMULAI PIPELINE CRYPTOWATCH (DEMO MODE)"
echo "=================================================="

# Aktifkan virtual environment
source venv/bin/activate

# Matikan proses python sebelumnya jika ada (biar nggak bentrok)
echo "[1/4] Membersihkan proses lama..."
pkill -f 'producer_api.py' 2>/dev/null
pkill -f 'producer_rss.py' 2>/dev/null
pkill -f 'consumer_to_hdfs.py' 2>/dev/null
pkill -f 'spark/analysis.py' 2>/dev/null
pkill -f 'app.py' 2>/dev/null

echo "[2/4] Menyalakan Kafka Producers..."
# Jalankan producers di background
PYTHONUNBUFFERED=1 python kafka/producer_api.py > /tmp/prod_api.log 2>&1 &
PYTHONUNBUFFERED=1 python kafka/producer_rss.py > /tmp/prod_rss.log 2>&1 &

echo "[3/4] Menyalakan HDFS Consumer..."
# Jalankan consumer di background
PYTHONUNBUFFERED=1 python kafka/consumer_to_hdfs.py > /tmp/consumer.log 2>&1 &

echo "[4/5] Menyalakan Spark Auto-Analyzer (tiap 60 detik)..."
# Jalankan spark berulang di background
while true; do
    PYTHONUNBUFFERED=1 python spark/analysis.py > /tmp/spark.log 2>&1
    sleep 60
done &
SPARK_PID=$!

echo "[5/5] Menyalakan Web Dashboard..."
# Jalankan dashboard
echo "=================================================="
echo "✅ SEMUA SISTEM BERJALAN!"
echo "🌐 Buka browser: http://localhost:5000"
echo "⬇️  Tekan CTRL+C untuk mematikan semua sistem."
echo "=================================================="

# Jalankan Flask di foreground (agar terminal tidak langsung tertutup)
PYTHONUNBUFFERED=1 python dashboard/app.py

# Jika Flask dihentikan (CTRL+C), matikan semua background process
echo "Mematikan pipeline..."
pkill -f 'producer_api.py' 2>/dev/null
pkill -f 'producer_rss.py' 2>/dev/null
pkill -f 'consumer_to_hdfs.py' 2>/dev/null
kill $SPARK_PID 2>/dev/null
echo "Selesai."

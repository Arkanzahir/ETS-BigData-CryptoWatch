#!/bin/bash
# Script untuk menjalankan semua komponen CryptoWatch ETS secara otomatis

echo "=================================================="
echo "🚀 MEMULAI PIPELINE CRYPTOWATCH (DEMO MODE)"
echo "=================================================="

# Aktifkan virtual environment
source venv/bin/activate

# Matikan proses python sebelumnya jika ada (biar nggak bentrok)
echo "[1/5] Membersihkan proses lama..."
pkill -f 'producer_api.py' 2>/dev/null
pkill -f 'producer_rss.py' 2>/dev/null
pkill -f 'consumer_to_hdfs.py' 2>/dev/null
pkill -f 'spark/analysis.py' 2>/dev/null
pkill -f 'app.py' 2>/dev/null

echo "[2/5] Menyalakan Infrastruktur Docker (Kafka & Hadoop)..."
docker-compose -f docker-compose-kafka.yml up -d
docker-compose -f docker-compose-hadoop.yml up -d
echo "Menunggu 20 detik agar Kafka dan Hadoop siap menerima data..."
sleep 20

echo "[2.5/5] Memastikan semua folder HDFS tersedia..."
docker exec hadoop-namenode hdfs dfs -mkdir -p /data/crypto/api
docker exec hadoop-namenode hdfs dfs -mkdir -p /data/crypto/rss
docker exec hadoop-namenode hdfs dfs -mkdir -p /data/crypto/hasil

echo "[3/5] Menyalakan Kafka Producers..."
# Jalankan producers di background
PYTHONUNBUFFERED=1 python kafka/producer_api.py > /tmp/prod_api.log 2>&1 &
PYTHONUNBUFFERED=1 python kafka/producer_rss.py > /tmp/prod_rss.log 2>&1 &

echo "[4/5] Menyalakan HDFS Consumer..."
# Jalankan consumer di background
PYTHONUNBUFFERED=1 python kafka/consumer_to_hdfs.py > /tmp/consumer.log 2>&1 &

echo "[5/5] Menyalakan Spark Auto-Analyzer (tiap 60 detik)..."
# Jalankan spark berulang di background
while true; do
    PYTHONUNBUFFERED=1 python spark/analysis.py > /tmp/spark.log 2>&1
    sleep 60
done &
SPARK_PID=$!

echo "[Mulai] Menyalakan Web Dashboard..."
# Jalankan Flask di BACKGROUND
PYTHONUNBUFFERED=1 python dashboard/app.py > /tmp/flask.log 2>&1 &
FLASK_PID=$!
echo "Menunggu 3 detik agar Flask siap..."
sleep 3

echo "=================================================="
echo "✅ SEMUA SISTEM BERJALAN!"
echo "🌐 Dashboard Lokal : http://localhost:5000"
echo "📱 QR Code publik  : Sedang digenerate oleh Pinggy..."
echo "⬇️  Tekan CTRL+C untuk mematikan semua sistem."
echo "=================================================="
echo ""
echo "📡 Membuka Tunnel Pinggy... (tekan 'u' untuk QR Code Unicode, 'c' untuk ASCII)"
ssh -p 443 -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -R0:localhost:5000 a.pinggy.io

# Jika Pinggy dihentikan (CTRL+C), matikan semua background process
echo ""
echo "Mematikan pipeline..."
pkill -f 'producer_api.py' 2>/dev/null
pkill -f 'producer_rss.py' 2>/dev/null
pkill -f 'consumer_to_hdfs.py' 2>/dev/null
pkill -f 'spark/analysis.py' 2>/dev/null
kill $FLASK_PID 2>/dev/null
kill $SPARK_PID 2>/dev/null
docker-compose -f docker-compose-kafka.yml down 2>/dev/null
docker-compose -f docker-compose-hadoop.yml down 2>/dev/null
echo "✅ Semua sistem berhasil dimatikan."

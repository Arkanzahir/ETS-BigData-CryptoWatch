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
# Paksa Hadoop keluar dari Safe Mode agar pembuatan folder tidak gagal
docker exec hadoop-namenode hdfs dfsadmin -safemode leave || true
sleep 2

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
echo "⬇️  Tekan CTRL+C untuk mematikan semua sistem."
echo "=================================================="
echo ""

# Coba jalankan Pinggy, tapi kalau gagal -> fallback ke Flask foreground
echo "📡 Mencoba membuka Tunnel Pinggy..."
ssh -p 443 -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -o ConnectTimeout=10 -R0:localhost:5000 a.pinggy.io 2>/dev/null

# Kalau Pinggy gagal (no internet / timeout), jangan matikan sistem!
if [ $? -ne 0 ]; then
    echo ""
    echo "⚠️  Pinggy gagal (tidak ada internet). Dashboard tetap berjalan di localhost!"
    echo "🌐 Buka browser: http://localhost:5000"
    echo "⬇️  Tekan CTRL+C untuk mematikan semua sistem."
    echo ""
    # Tunggu di sini supaya script tidak langsung exit
    wait $FLASK_PID
fi

# Jika Pinggy/Flask dihentikan (CTRL+C), matikan semua background process
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


#!/bin/bash
# Script untuk mematikan SEMUA komponen CryptoWatch secara bersih

echo "=================================================="
echo "🛑 MEMATIKAN PIPELINE CRYPTOWATCH"
echo "=================================================="

echo "[1/3] Mematikan semua proses Python..."
pkill -f 'producer_api.py' 2>/dev/null && echo "  ✅ producer_api stopped" || echo "  ℹ️  producer_api sudah mati"
pkill -f 'producer_rss.py' 2>/dev/null && echo "  ✅ producer_rss stopped" || echo "  ℹ️  producer_rss sudah mati"
pkill -f 'consumer_to_hdfs.py' 2>/dev/null && echo "  ✅ consumer_to_hdfs stopped" || echo "  ℹ️  consumer_to_hdfs sudah mati"
pkill -f 'spark/analysis.py' 2>/dev/null && echo "  ✅ spark analysis stopped" || echo "  ℹ️  spark analysis sudah mati"
pkill -f 'dashboard/app.py' 2>/dev/null && echo "  ✅ flask dashboard stopped" || echo "  ℹ️  flask dashboard sudah mati"

echo "[2/3] Mematikan Docker containers..."
docker-compose -f docker-compose-kafka.yml down 2>/dev/null
docker-compose -f docker-compose-hadoop.yml down 2>/dev/null

echo "[3/3] Verifikasi..."
RUNNING=$(docker ps --format '{{.Names}}' | wc -l)
if [ "$RUNNING" -eq "0" ]; then
    echo "  ✅ Semua container sudah berhenti!"
else
    echo "  ⚠️  Masih ada $RUNNING container yang berjalan:"
    docker ps --format '  - {{.Names}}'
fi

echo "=================================================="
echo "✅ PIPELINE BERHASIL DIMATIKAN SEPENUHNYA"
echo "   Untuk menyalakan kembali: ./run_demo.sh"
echo "=================================================="

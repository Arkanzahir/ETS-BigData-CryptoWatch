# CryptoWatch Big Data & Data Lakehouse Pipeline

**Kelompok 7 Pembagian Tugas:**
- **Mohamad Arkan Zahir A. (Anggota 1):** Setup Docker (Hadoop & Kafka), buat topic, troubleshooting infrastruktur
- **Zahra Hafizhah (Anggota 2):** `producer_api.py` — integrasi API eksternal
- **Nafis Faqih A.M. (Anggota 3):** `producer_rss.py` + `consumer_to_hdfs.py`
- **Tiara Fatimah Azzahra (Anggota 4):** `spark/analysis.ipynb` — 3 analisis wajib (+ 1 bonus MLlib)
- **Ananda Widi Alrafi (Anggota 5):** `dashboard/app.py` + `index.html`


## Deskripsi Proyek
CryptoWatch adalah sebuah end-to-end Big Data Pipeline untuk memantau harga dan berita Cryptocurrency (Bitcoin, Ethereum, Binance Coin) secara real-time. Proyek ini dibangun untuk memenuhi evaluasi tengah semester (ETS) mata kuliah Big Data dan Data Lakehouse.

## Arsitektur Sistem
Sistem ini menggunakan arsitektur 4-layer:
1. **Ingestion Layer (Apache Kafka):** Menggunakan `kafka-python-ng` untuk mengambil data dari CoinGecko API (harga) dan CoinDesk RSS (berita), dan mendistribusikannya ke dalam topic `crypto-api` dan `crypto-rss`.
2. **Storage Layer (HDFS):** Konsumen membaca dari Kafka dan menyimpan data dalam batch 2-menitan ke Hadoop Distributed File System (HDFS).
3. **Processing Layer (Apache Spark):** Spark membaca data dari HDFS, memproses analitik, dan menyimpan hasilnya kembali.
4. **Serving Layer (Flask & Chart.js):** Dashboard Flask yang secara real-time menarik kombinasi data live (dari Kafka/local buffer) dan data batch analitik (dari Spark/HDFS).

## Cara Menjalankan

### 1. Setup Infrastruktur (Docker)
Pastikan Docker dan Docker Compose telah terinstall, lalu jalankan:
```bash
# Menjalankan Kafka (KRaft mode)
docker compose -f docker-compose-kafka.yml up -d

# Menjalankan Hadoop Cluster
docker compose -f docker-compose-hadoop.yml up -d
```

### 2. Setup Python Environment
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Eksekusi Pipeline
Buka beberapa terminal untuk menjalankan setiap komponen pipeline secara paralel.

**Terminal 1: Producer API**
```bash
source venv/bin/activate
python kafka/producer_api.py
```

**Terminal 2: Producer RSS**
```bash
source venv/bin/activate
python kafka/producer_rss.py
```

**Terminal 3: Consumer to HDFS**
```bash
source venv/bin/activate
python kafka/consumer_to_hdfs.py
```

**Terminal 4: Spark Analysis**
(Biarkan producer dan consumer berjalan sekitar ~2-3 menit agar ada data di HDFS terlebih dahulu)
```bash
source venv/bin/activate
python spark/analysis.py
```

**Terminal 5: Web Dashboard**
```bash
source venv/bin/activate
python dashboard/app.py
```
Akses dashboard di browser Anda: `http://localhost:5000`

## Analisis Spark (Wajib + Bonus MLlib)
Proyek ini mengimplementasikan 3 analisis wajib dan 1 analisis bonus menggunakan PySpark:
1. **Statistik Harga (DataFrame API):** Menghitung nilai Average, Max, Min, dan Standard Deviation (Volatilitas) dari harga koin.
2. **Volatilitas Per Jam (Spark SQL):** Mengagregasi pergerakan harga Absolut (`change_24h`) berdasarkan jam untuk melihat waktu paling aktif untuk ditradingkan.
3. **Volume Berita Per Jam (Spark SQL):** Menghitung seberapa banyak artikel berita kripto diterbitkan setiap jamnya, sebagai indikator sentimen pasar potensial.
4. **K-Means Clustering (Spark MLlib):** *(BONUS)* Mengelompokkan koin secara otomatis ke dalam 3 klaster berbeda berdasarkan profil harga dan volatilitas perubahannya.

## Klaim Bonus Poin (+10 Poin)
Kami telah mengimplementasikan seluruh kriteria bonus:
- **[+5 poin] Analisis MLlib:** Telah ditambahkan analisis _K-Means Clustering_ di PySpark untuk memetakan kategori volatilitas koin.
- **[+3 poin] Dashboard interaktif:** Kami menggunakan **Chart.js** untuk merender secara visual output agregat dari Spark SQL (seperti Bar Chart untuk volatilitas, dan Line chart untuk trend volume berita per jam).
- **[+2 poin] HDFS via Library Python:** Consumer kami _(`consumer_to_hdfs.py`)_ menyimpan data ke HDFS memanfaatkan library `hdfs` (via `InsecureClient`), **bukan** subprocess bash.

## Tantangan & Solusi
- **WSL File Descriptor Limit:** Hadoop sering crash di WSL (`unable to allocate file descriptor table`). **Solusi:** Kami menambahkan konfigurasi `ulimits` (nofile: 65536) secara explisit ke semua layanan Hadoop di dalam file `docker-compose-hadoop.yml`.
- **HDFS Port Mapping:** Spark berjalan di local environment sedangkan HDFS di dalam Docker. **Solusi:** Kami mengonfigurasi `fs.defaultFS` ke `hdfs://localhost:8020` agar host OS bisa berkomunikasi langsung dengan NameNode container.
- **Kafka Python Compatibility:** Library `kafka-python` lama tidak stabil di Python 3.12+. **Solusi:** Kami menggunakan library fork terbaru yaitu `kafka-python-ng`.

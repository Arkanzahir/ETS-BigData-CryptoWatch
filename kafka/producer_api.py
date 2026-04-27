"""
producer_api.py — CoinGecko Price Producer
# [Ananda Widi Alrafi]: Setup Kafka producer untuk API real-time CoinGecko

Polling CoinGecko Simple Price API setiap 60 detik.
Mengirim harga BTC, ETH, BNB ke topic 'crypto-api'.
Key = simbol koin (bitcoin, ethereum, binancecoin).
"""

import json
import time
import requests
from datetime import datetime
from kafka import KafkaProducer

# Konfigurasi
COINGECKO_URL = "https://api.coingecko.com/api/v3/simple/price"
COINS = "bitcoin,ethereum,binancecoin"
PARAMS = {
    "ids": COINS,
    "vs_currencies": "usd,idr",
    "include_24hr_change": "true",
    "include_last_updated_at": "true"
}

SYMBOL_MAP = {
    "bitcoin": "BTC",
    "ethereum": "ETH",
    "binancecoin": "BNB"
}

TOPIC = "crypto-api"
POLL_INTERVAL = 60  # detik

# Setup Kafka Producer
producer = KafkaProducer(
    bootstrap_servers=["localhost:9092"],
    value_serializer=lambda v: json.dumps(v).encode("utf-8"),
    key_serializer=lambda k: k.encode("utf-8"),
    acks="all",
    linger_ms=10,
    compression_type="lz4",
)

print("=" * 60)
print("  💰 CryptoWatch — Producer API (CoinGecko)")
print(f"  Topic: {TOPIC}")
print(f"  Koin: {COINS}")
print(f"  Interval: {POLL_INTERVAL}s")
print("=" * 60)

count = 0
try:
    while True:
        try:
            response = requests.get(COINGECKO_URL, params=PARAMS, timeout=10)
            response.raise_for_status()
            data = response.json()

            for coin_id, prices in data.items():
                symbol = SYMBOL_MAP.get(coin_id, coin_id.upper())
                event = {
                    "symbol": symbol,
                    "coin_id": coin_id,
                    "price_usd": prices.get("usd", 0),
                    "price_idr": prices.get("idr", 0),
                    "change_24h": prices.get("usd_24h_change", 0),
                    "last_updated": prices.get("last_updated_at", 0),
                    "timestamp": datetime.now().isoformat(),
                }

                producer.send(
                    topic=TOPIC,
                    key=symbol,
                    value=event
                )
                count += 1

            producer.flush()
            ts = datetime.now().strftime("%H:%M:%S")
            btc = data.get("bitcoin", {}).get("usd", "N/A")
            eth = data.get("ethereum", {}).get("usd", "N/A")
            bnb = data.get("binancecoin", {}).get("usd", "N/A")
            print(f"[{ts}] Sent #{count} | BTC=${btc:,.2f} | ETH=${eth:,.2f} | BNB=${bnb:,.2f}")

        except requests.exceptions.RequestException as e:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] ⚠️  API Error: {e}")
        except Exception as e:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] ❌ Error: {e}")

        time.sleep(POLL_INTERVAL)

except KeyboardInterrupt:
    print(f"\n✋ Producer dihentikan. Total event terkirim: {count}")
finally:
    producer.flush()
    producer.close()

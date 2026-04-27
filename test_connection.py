#!/usr/bin/env python3
"""Quick test to verify CoinGecko API and Kafka work"""
import json
import requests
from datetime import datetime

print("Testing CoinGecko API...")
COINGECKO_URL = "https://api.coingecko.com/api/v3/simple/price"
PARAMS = {
    "ids": "bitcoin,ethereum,binancecoin",
    "vs_currencies": "usd,idr",
    "include_24hr_change": "true",
    "include_last_updated_at": "true"
}

try:
    response = requests.get(COINGECKO_URL, params=PARAMS, timeout=15)
    print(f"Status: {response.status_code}")
    data = response.json()
    for coin, prices in data.items():
        print(f"  {coin}: ${prices.get('usd', 'N/A'):,.2f}")
    print("API OK!")
except Exception as e:
    print(f"API Error: {e}")

print("\nTesting Kafka connection...")
try:
    from kafka import KafkaProducer
    producer = KafkaProducer(
        bootstrap_servers=["localhost:9092"],
        value_serializer=lambda v: json.dumps(v).encode("utf-8"),
        key_serializer=lambda k: k.encode("utf-8"),
        acks="all",
    )
    test_msg = {"test": True, "ts": datetime.now().isoformat()}
    producer.send("crypto-api", key="test", value=test_msg).get(timeout=5)
    print("Kafka OK!")
    producer.close()
except Exception as e:
    print(f"Kafka Error: {e}")

"""
producer_rss.py — CoinDesk RSS Feed Producer
# [Nafis Faqih Allmuzaky Maolidi]: Setup Kafka producer untuk RSS feed berita kripto

Polling CoinDesk RSS feed setiap 5 menit.
Mengirim artikel berita ke topic 'crypto-rss'.
Key = hash 8 karakter dari URL artikel.
Deduplikasi berdasarkan URL.
"""

import json
import time
import hashlib
import feedparser
from datetime import datetime
from kafka import KafkaProducer

# Konfigurasi
RSS_FEEDS = [
    "https://www.coindesk.com/arc/outboundfeeds/rss/",
    "https://cointelegraph.com/rss",
]

TOPIC = "crypto-rss"
POLL_INTERVAL = 300  # 5 menit

# Track artikel yang sudah dikirim (hindari duplikat)
sent_urls = set()

# Setup Kafka Producer
producer = KafkaProducer(
    bootstrap_servers=["localhost:9092"],
    value_serializer=lambda v: json.dumps(v).encode("utf-8"),
    key_serializer=lambda k: k.encode("utf-8"),
    acks="all",
    linger_ms=10,
    compression_type="lz4",
)

def hash_url(url):
    """Generate 8-char hash dari URL untuk key Kafka."""
    return hashlib.md5(url.encode()).hexdigest()[:8]

def fetch_rss(feed_url):
    """Parse RSS feed dan return list artikel baru."""
    articles = []
    try:
        feed = feedparser.parse(feed_url)
        source = feed.feed.get("title", feed_url)

        for entry in feed.entries[:10]:  # Ambil 10 artikel terbaru
            url = entry.get("link", "")
            if url in sent_urls:
                continue  # Skip duplikat

            article = {
                "title": entry.get("title", "No Title"),
                "link": url,
                "summary": entry.get("summary", "")[:500],  # Potong max 500 char
                "published": entry.get("published", datetime.now().isoformat()),
                "source": source,
                "timestamp": datetime.now().isoformat(),
            }
            articles.append(article)
            sent_urls.add(url)

    except Exception as e:
        print(f"  ⚠️  Error parsing {feed_url}: {e}")

    return articles

print("=" * 60)
print("  📰 CryptoWatch — Producer RSS (CoinDesk + CoinTelegraph)")
print(f"  Topic: {TOPIC}")
print(f"  Interval: {POLL_INTERVAL}s (5 menit)")
print("=" * 60)

total_sent = 0
try:
    while True:
        new_articles = 0
        for feed_url in RSS_FEEDS:
            articles = fetch_rss(feed_url)
            for article in articles:
                key = hash_url(article["link"])
                producer.send(
                    topic=TOPIC,
                    key=key,
                    value=article
                )
                new_articles += 1
                total_sent += 1

        producer.flush()
        ts = datetime.now().strftime("%H:%M:%S")
        print(f"[{ts}] Sent {new_articles} artikel baru (total: {total_sent}, tracked: {len(sent_urls)})")

        time.sleep(POLL_INTERVAL)

except KeyboardInterrupt:
    print(f"\n✋ Producer RSS dihentikan. Total artikel terkirim: {total_sent}")
finally:
    producer.flush()
    producer.close()

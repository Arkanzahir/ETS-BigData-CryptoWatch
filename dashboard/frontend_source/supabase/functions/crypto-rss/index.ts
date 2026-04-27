import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  hash: string;
  source: string;
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

function parseRSS(xml: string, source: string): RSSItem[] {
  const items: RSSItem[] = [];
  const itemRegex = /<item[\s\S]*?<\/item>/gi;
  const matches = xml.match(itemRegex) || [];

  for (const match of matches.slice(0, 10)) {
    const titleMatch = match.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/);
    const linkMatch = match.match(/<link>(.*?)<\/link>/);
    const dateMatch = match.match(/<pubDate>(.*?)<\/pubDate>/);

    if (titleMatch && linkMatch) {
      const title = (titleMatch[1] || titleMatch[2] || '').trim();
      const link = (linkMatch[1] || '').trim();
      const pubDate = (dateMatch?.[1] || new Date().toISOString()).trim();
      items.push({ title, link, pubDate, hash: simpleHash(title + link), source });
    }
  }
  return items;
}

function generateNewsVolume(items: RSSItem[]) {
  const hourMap: Record<string, number> = {};
  const now = new Date();

  for (let i = 23; i >= 0; i--) {
    const h = new Date(now.getTime() - i * 3600000);
    const label = h.getHours().toString().padStart(2, '0') + ':00';
    hourMap[label] = 0;
  }

  for (const item of items) {
    try {
      const d = new Date(item.pubDate);
      const label = d.getHours().toString().padStart(2, '0') + ':00';
      if (label in hourMap) hourMap[label]++;
    } catch { /* skip invalid dates */ }
  }

  return Object.entries(hourMap).map(([hour, count]) => ({ hour, count }));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const feeds = [
      { url: "https://www.coindesk.com/arc/outboundfeeds/rss/", source: "CoinDesk" },
      { url: "https://cointelegraph.com/rss", source: "Cointelegraph" },
    ];

    const allItems: RSSItem[] = [];

    for (const feed of feeds) {
      try {
        const res = await fetch(feed.url, {
          headers: { "User-Agent": "CryptoDashboard/1.0" },
        });
        if (res.ok) {
          const xml = await res.text();
          const items = parseRSS(xml, feed.source);
          allItems.push(...items);
        }
      } catch { /* skip failed feed */ }
    }

    allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    const volumes = generateNewsVolume(allItems);

    return new Response(
      JSON.stringify({ items: allItems.slice(0, 20), volumes }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// services/rssService.js
import axios from "axios";
import { parseStringPromise } from "xml2js";

export async function fetchRSS(url) {
    try {
        const res = await axios.get(url, { timeout: 8000 });
        const parsed = await parseStringPromise(res.data);

        const items = parsed.rss.channel[0].item.slice(0, 5);

        return items.map(item => ({
            title: item.title[0],
            link: item.link[0],
            desc: item.description[0].replace(/<[^>]+>/g, "").slice(0, 300),
            pubDate: item.pubDate?.[0] || "",
        }));
    } catch {
        return [];
    }
}
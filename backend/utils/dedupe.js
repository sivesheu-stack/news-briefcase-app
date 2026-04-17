// utils/dedupe.js
export function dedupeArticles(articles) {
    const seen = new Set();

    return articles.filter(a => {
        const key = a.title.slice(0, 40).toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}
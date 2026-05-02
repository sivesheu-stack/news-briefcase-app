// config/constants.js

export const RSS_SOURCES = {
    "Finance & Markets": [
        { name: "Business Standard — Markets", url: "https://www.business-standard.com/rss/markets-106.rss" },
        { name: "Livemint — Markets", url: "https://livemint.com/rss/markets" },
        { name: "Moneycontrol — Latest", url: "https://www.moneycontrol.com/rss/latestnews.xml" },
        { name: "Economic Times — Markets", url: "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms" },
    ],
    "Corporate News": [
        { name: "Business Standard — Companies", url: "https://www.business-standard.com/rss/companies-101.rss" },
        { name: "Livemint — Companies", url: "https://livemint.com/rss/companies" },
        { name: "Economic Times — Companies", url: "https://economictimes.indiatimes.com/industry/rssfeeds/13352306.cms" },
    ],
    "Economics": [
        { name: "Business Standard — Economy", url: "https://www.business-standard.com/rss/economy-102.rss" },
        { name: "Financial Express", url: "https://www.financialexpress.com/feed/" },
        { name: "Economic Times — Economy", url: "https://economictimes.indiatimes.com/news/economy/rssfeeds/1373380680.cms" },
    ],
    "Geopolitics": [
        { name: "Business Standard — World", url: "https://www.business-standard.com/rss/world-news-221.rss" },
        { name: "Livemint — Politics", url: "https://livemint.com/rss/politics" },
        { name: "Hindu BusinessLine", url: "https://www.thehindubusinessline.com/?service=rss" },
    ],
    "Public Policy": [
        { name: "Business Standard — India", url: "https://www.business-standard.com/rss/india-news-216.rss" },
        { name: "Livemint — News", url: "https://livemint.com/rss/news" },
        { name: "Economic Times — Policy", url: "https://economictimes.indiatimes.com/news/economy/policy/rssfeeds/1052732854.cms" },
    ],
    "Tech & Innovation": [
        { name: "Economic Times — Tech", url: "https://economictimes.indiatimes.com/tech/rssfeeds/78570551.cms" },
        { name: "Livemint — Technology", url: "https://livemint.com/rss/technology" },
        { name: "Financial Express — Tech", url: "https://www.financialexpress.com/feed/" },
    ],
    "Energy & Climate": [
        { name: "Business Standard — Industry", url: "https://www.business-standard.com/rss/industry-217.rss" },
        { name: "Economic Times — Energy", url: "https://economictimes.indiatimes.com/industry/energy/rssfeeds/13358755.cms" },
    ],
    "Real Estate": [
        { name: "Business Standard — RE", url: "https://www.business-standard.com/rss/content/real-estate-22310.rss" },
        { name: "Economic Times — RE", url: "https://economictimes.indiatimes.com/industry/services/property-/-cstruction/rssfeeds/13358306.cms" },
    ],
};

export const VALID_INTERESTS = Object.keys(RSS_SOURCES);
export const VALID_LEVELS = ["beginner", "intermediate", "advanced"];
export const MAX_ARTICLES = 35;
export const MAX_PER_FEED = 5;
export const FETCH_TIMEOUT_MS = 9000;

export const LEVEL_INSTRUCTIONS = {
    beginner: `
    - Explain EVERY financial and economic term in plain English.
    - Add a "jargon" array with definitions for all specialist words used.
    - Write implications as: "What this means for you: ...".
    - Assume zero prior knowledge of markets or finance.
  `,
    intermediate: `
    - Use standard financial terminology; briefly define genuinely complex or niche terms in parentheses.
    - Include a "jargon" array only for terms a non-specialist might not know.
    - Implications should include market or policy context.
  `,
    advanced: `
    - Use full professional financial and economic terminology without simplification.
    - The "jargon" array should be empty [].
    - Focus on implications, macro context, second-order effects, and data.
  `,
};

export const DEMO_LEADERBOARD = [
    { id: "aisha_k", name: "Aisha K.", streak: 22 },
    { id: "rohan_m", name: "Rohan M.", streak: 18 },
    { id: "priya_s", name: "Priya S.", streak: 14 },
    { id: "vikram_j", name: "Vikram J.", streak: 9 },
    { id: "sneha_r", name: "Sneha R.", streak: 7 },
];

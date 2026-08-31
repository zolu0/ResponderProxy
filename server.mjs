import "dotenv/config";
import express from "express";

const app = express();
const port = Number(process.env.PORT || 3210);
const xUsernames = [
    "David_Ornstein",
    "FabrizioRomano",
    "JacobsBen",
    "Matt_Law_DT",
    "NizaarKinsella"
];
const xUserIds = new Map();

app.use(express.json());
app.use((request, response, next) => {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "Content-Type");
    response.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    next();
});

async function xRequest(path) {
    const token = process.env.X_BEARER_TOKEN;
    if (!token) throw new Error("X_BEARER_TOKEN is not set");

    const response = await fetch(`https://api.x.com${path}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const body = await response.json();
    if (!response.ok) throw new Error(`X API ${response.status}: ${JSON.stringify(body)}`);
    return body;
}

async function getXUserId(username) {
    if (xUserIds.has(username)) return xUserIds.get(username);
    const body = await xRequest(`/2/users/by/username/${username}`);
    const userId = body.data?.id;
    if (!userId) throw new Error(`X did not return a user ID for ${username}`);
    xUserIds.set(username, userId);
    return userId;
}

app.get("/x/posts", async (request, response) => {
    try {
        let sinceIds = {};
        if (typeof request.query.since_ids === "string") {
            const parsed = JSON.parse(request.query.since_ids);
            if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) sinceIds = parsed;
        }

        const accountPosts = await Promise.all(xUsernames.map(async username => {
            const userId = await getXUserId(username);
            const params = new URLSearchParams({
                max_results: "10",
                exclude: "retweets,replies",
                "tweet.fields": "created_at"
            });
            if (typeof sinceIds[username] === "string" && /^\d+$/.test(sinceIds[username])) {
                params.set("since_id", sinceIds[username]);
            }

            const body = await xRequest(`/2/users/${userId}/tweets?${params}`);
            return (body.data || []).map(post => ({
                id: post.id,
                username,
                createdAt: post.created_at
            }));
        }));

        response.json({ posts: accountPosts.flat() });
    } catch (error) {
        console.error("X feed request failed:", error);
        response.status(502).json({ error: String(error.message || error) });
    }
});

app.post("/gemini", async (request, response) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

        const apiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: request.body.prompt }] }] })
            }
        );
        const data = await apiResponse.json();
        if (!apiResponse.ok) throw new Error(`Gemini ${apiResponse.status}: ${JSON.stringify(data)}`);
        response.json({ reply: data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null });
    } catch (error) {
        console.error("Gemini request failed:", error);
        response.status(502).json({ error: String(error.message || error) });
    }
});

app.listen(port, "127.0.0.1", () => {
    console.log(`Responder Proxy running on http://127.0.0.1:${port}`);
});

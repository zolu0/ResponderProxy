# Responder proxy

1. Copy `.env.example` to `.env`.
2. Add your `GEMINI_API_KEY` and X developer `X_BEARER_TOKEN`.
3. Run `npm install` in this directory.
4. Run `npm start` and leave it open while Discord is running.

The server binds only to `127.0.0.1`. X credentials remain in the local `.env` file.

`GET /x/posts` fetches original posts (excluding replies and reposts) from:

- `David_Ornstein`
- `FabrizioRomano`
- `JacobsBen`
- `Matt_Law_DT`
- `NizaarKinsella`

The Vencord plugin polls this endpoint once per minute and tracks a separate last-seen post ID for every account.

Only posts containing one of these Big Six club names are returned: Chelsea,
Manchester City/Man City, Manchester United/Man United/Man Utd, Arsenal,
Tottenham, or Liverpool. Matching is case-insensitive.

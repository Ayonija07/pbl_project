# GrowFi

GrowFi is a beginner-friendly financial literacy app with a local Marketstack integration for live watchlists and recent market trends.

## Run locally

1. Make sure Node.js 22 or newer is installed.
2. Create `.env` from `.env.example` and set `MARKETSTACK_API_KEY`.
3. Start the app:

```powershell
npm start
```

4. Open [http://127.0.0.1:3000](http://127.0.0.1:3000)

### Easier launch on Windows

You can also use the included batch files:

- double-click `open-growfi.bat` to start the server and open the site
- double-click `start-growfi.bat` to only start the server

Keep the server window open while using GrowFi.

## Features

- financial learning modules
- investment readiness checker
- Marketstack-powered watchlist
- 7-day trend chart
- compare mode for two symbols
- risk-based investment suggestions

## Environment variables

- `MARKETSTACK_API_KEY`: required for market data
- `PORT`: optional, defaults to `3000`

## Deployment notes

- keep `.env` out of version control
- set `MARKETSTACK_API_KEY` in your hosting provider's environment settings
- start command: `npm start`
- the app serves static files and API routes from `server.js`, so it works well on simple Node hosts like Render, Railway, or a small VPS

## Quick check

```powershell
npm run check
```

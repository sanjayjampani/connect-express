# Connect Express

Find a direct train, or one change of train, between stations in Tamil Nadu, Karnataka, and Andhra Pradesh.

Stations are the 58 listed in `backend/data/index.js`. Trains in `backend/data/trains.json` come from the Indian Railways timetable dated 30 August 2026 (NTES, GTFS version 2026-08-30-02-22-43, published at https://github.com/Neo2308/indianrailways-gtfs). A train is included only when that file still schedules it on or after 2 November 2026 and it stops at two or more of these stations. Stops outside the list are omitted. Connecting routes are plain JavaScript. Register and login issue a JWT. Search still has no calendar date, so a train that runs only on some days is shown on every search.

A sentence such as "Tirupati Main to Chirala after 6pm" is split on "to". An optional "after" sets the earliest departure. Each side is matched to a station name on the list. "Chennai" alone is rejected because two stations share that word. The timetable search then runs as usual.

`backend/.env` needs `MONGO_URI` and `JWT_SECRET`. Copy `.env.example` if you do not have one.

## Run

```bash
cd backend && cp .env.example .env   # set MONGO_URI
npm install && npm start             # http://localhost:5002

cd frontend && npm install && npm run dev   # http://localhost:5173
```

Frontend calls `VITE_API_URL`, or `http://localhost:5002/api` if that is unset.

## Test

```bash
cd backend && npm test
```

The test checks that seeded days only move forward, and that a train which already left is not offered as a connection.

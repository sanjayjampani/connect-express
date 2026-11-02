# Connect Express

Find a direct train, or one change of train, between stations in Tamil Nadu, Karnataka, and Andhra Pradesh.

Trains are a fixed timetable generated from `backend/data/index.js` and stored in MongoDB. Connecting routes are plain JavaScript. Register and login issue a JWT. The travel date is not a search input: the timetable has no calendar dates, only a day offset on each stop.

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

# Connect Express 🚄

<p align="center">
  <img src="https://skillicons.dev/icons?i=react,nodejs,express,mongodb,js,vite" alt="React, Node.js, Express, MongoDB, JavaScript, Vite" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
</p>

Find a direct train, or one change of train, between stations in Tamil Nadu, Karnataka, and Andhra Pradesh.

Connecting search is plain JavaScript. Not a C++ addon.

## ✨ What it does

- 🔍 Search two stations for a **direct train** or **one change**
- 🗣️ Type a sentence such as `Tirupati Main to Chirala after 6pm`
- 💾 Register, log in (JWT), and **save trips** on the account
- 📅 Uses the **30 August 2026** Indian Railways timetable (NTES / GTFS)

## 🗺️ Scope

Stations are the 58 listed in `backend/data/index.js`. Trains in `backend/data/trains.json` come from [indianrailways-gtfs](https://github.com/Neo2308/indianrailways-gtfs) (GTFS version `2026-08-30-02-22-43`). A train is included only when that file still schedules it on or after 2 November 2026 and it stops at two or more of these stations. Stops outside the list are omitted.

Search still has no calendar date, so a train that runs only on some days is shown on every search.

`Chennai` alone is rejected because two stations share that word. Each side of `to` is matched to a name on the list. An optional `after` sets the earliest departure.

## 🚀 Run

**Need:** Node.js, MongoDB, and a `JWT_SECRET`.

```bash
# backend — http://localhost:5002
cd backend
cp .env.example .env   # set MONGO_URI and JWT_SECRET
npm install && npm start

# frontend — http://localhost:5173
cd frontend
npm install && npm run dev
```

Frontend calls `VITE_API_URL`, or `http://localhost:5002/api` if that is unset. Copy `frontend/.env.example` if you want to set it.

## 🧪 Test

```bash
cd backend && npm test
```

The tests check that seeded days only move forward, and that a train which already left is not offered as a connection.

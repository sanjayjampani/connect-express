// server
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const { PORT } = require('./config');
const apiRoutes = require('./routes');
const { seedDatabase } = require('./services/seeder.service');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

// health check
app.get('/', (req, res) => {
  res.json({
    message: 'Connect Express API is running!',
    endpoints: {
      stations: 'GET /api/stations',
      search: 'GET /api/search?from=STATION_CODE&to=STATION_CODE'
    }
  });
});

// start server
async function startServer() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('Database connection string (MONGO_URI or MONGODB_URI) not found in environment variables');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas');

    const { stationCount, trainCount } = await seedDatabase();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Stations: ${stationCount} | Trains: ${trainCount}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

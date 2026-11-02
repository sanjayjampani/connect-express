const { Station, Train } = require('../models');
const { stations } = require('../data');
// NTES timetable dated 30 Aug 2026. See backend/data/trains.json.
const trains = require('../data/trains.json');

async function seedDatabase() {
  await Station.deleteMany({});
  await Train.deleteMany({});
  await Station.insertMany(stations);
  await Train.insertMany(trains);
  return { stationCount: stations.length, trainCount: trains.length };
}

module.exports = { seedDatabase, timetable: () => trains };

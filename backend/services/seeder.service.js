const { Station, Train } = require('../models');
const { stations, routes } = require('../data');
const { addMinutes } = require('../utils');

const TRAIN_NAMES = ['Shatabdi Express', 'Rajdhani Express', 'Duronto Express', 'Garib Rath', 'Humsafar Express', 'Tejas Express', 'Vande Bharat', 'Jan Shatabdi', 'Superfast Express', 'Mail', 'Express', 'Intercity'];

// Same inputs always produce the same timetable. No Math.random, so a reseed cannot reshuffle.
function generateTrains() {
  const trains = [];
  let trainNumber = 12001;

  routes.forEach((route, ri) => {
    for (let t = 0; t < 3; t++) {
      const startHour = (5 + ri + t * 7) % 24;
      const startMinute = (t * 30) % 60;
      let currentTime = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;
      let currentDay = 1;

      const stops = route.map((stationCode, index) => {
        if (index === 0) {
          return { stationCode, arrivalTime: null, departureTime: currentTime, day: currentDay };
        }

        const travelMinutes = 40 + ((ri + index * 3 + t) % 8) * 10;
        const arr = addMinutes(currentTime, travelMinutes, currentDay);
        currentTime = arr.time;
        currentDay = arr.day;

        if (index === route.length - 1) {
          return { stationCode, arrivalTime: arr.time, departureTime: null, day: currentDay };
        }

        const haltMinutes = 2 + ((index + t) % 6);
        const dep = addMinutes(arr.time, haltMinutes, currentDay);
        currentTime = dep.time;
        currentDay = dep.day;
        return { stationCode, arrivalTime: arr.time, departureTime: currentTime, day: currentDay };
      });

      trains.push({
        trainNumber: String(trainNumber),
        trainName: TRAIN_NAMES[(ri + t) % TRAIN_NAMES.length],
        stops
      });
      trainNumber += 2;
    }
  });

  return trains;
}

// Generated timetable, not user data. Replace on boot so an older random seed cannot stick.
async function seedDatabase() {
  await Station.deleteMany({});
  await Train.deleteMany({});

  const uniqueStations = [...new Map(stations.map(s => [s.code, s])).values()];
  await Station.insertMany(uniqueStations);

  const trains = generateTrains();
  await Train.insertMany(trains);

  return { stationCount: uniqueStations.length, trainCount: trains.length };
}

module.exports = { seedDatabase, generateTrains };

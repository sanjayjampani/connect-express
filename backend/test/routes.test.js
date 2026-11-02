process.env.JWT_SECRET ||= 'test-secret';

const test = require('node:test');
const assert = require('node:assert/strict');
const { timeToMinutes } = require('../utils');
const { generateTrains } = require('../services/seeder.service');
const { findConnectingRoutes } = require('../services/search.service');

test('timetable days only move forward', () => {
  for (const train of generateTrains()) {
    let prev = -1;
    for (const stop of train.stops) {
      const mins = timeToMinutes(stop.departureTime || stop.arrivalTime, stop.day);
      assert.ok(mins >= prev, `${train.trainNumber} goes backwards at ${stop.stationCode}`);
      prev = mins;
    }
  }
});

test('a train that already left is not a connection', () => {
  const arrived = {
    trainNumber: '1',
    trainName: 'A',
    stops: [
      { stationCode: 'MAS', departureTime: '20:00', day: 1 },
      { stationCode: 'KPD', arrivalTime: '22:00', day: 1 }
    ]
  };
  // Leaves KPD at 10:00 the same day. Old C++ added 1440 and called this a 12h layover.
  const alreadyLeft = {
    trainNumber: '2',
    trainName: 'B',
    stops: [
      { stationCode: 'KPD', departureTime: '10:00', day: 1 },
      { stationCode: 'SBC', arrivalTime: '14:00', day: 1 }
    ]
  };
  const nextMorning = {
    trainNumber: '3',
    trainName: 'C',
    stops: [
      { stationCode: 'KPD', departureTime: '00:30', day: 2 },
      { stationCode: 'SBC', arrivalTime: '04:30', day: 2 }
    ]
  };

  const routes = findConnectingRoutes([arrived], [alreadyLeft, nextMorning], 'MAS', 'SBC');
  assert.deepEqual(routes.map(r => r.train2.trainNumber), ['3']);
  assert.equal(routes[0].layover, 150);
});

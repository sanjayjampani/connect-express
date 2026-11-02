process.env.JWT_SECRET ||= 'test-secret';

const test = require('node:test');
const assert = require('node:assert/strict');
const { timeToMinutes } = require('../utils');
const { timetable } = require('../services/seeder.service');
const { findConnectingRoutes } = require('../services/search.service');
const { interpret, filterDepartures, readSentence, unclearStation } = require('../services/sentence.service');
const { applyBookmark, knownTrip, requireUser } = require('../controllers/auth.controller');

test('timetable days only move forward', () => {
  for (const train of timetable()) {
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

test('a connection that rides back through the origin is dropped', () => {
  const south = {
    trainNumber: '1',
    trainName: 'South',
    stops: [
      { stationCode: 'OGL', departureTime: '20:01', day: 1 },
      { stationCode: 'NLR', arrivalTime: '20:51', departureTime: '20:56', day: 1 }
    ]
  };
  const north = {
    trainNumber: '2',
    trainName: 'North',
    stops: [
      { stationCode: 'NLR', departureTime: '22:29', day: 1 },
      { stationCode: 'OGL', arrivalTime: '23:20', departureTime: '23:25', day: 1 },
      { stationCode: 'CLX', arrivalTime: '02:42', day: 2 }
    ]
  };
  const alreadyThere = {
    trainNumber: '3',
    trainName: 'Past',
    stops: [
      { stationCode: 'OGL', departureTime: '10:00', day: 1 },
      { stationCode: 'CLX', arrivalTime: '11:00', departureTime: '11:05', day: 1 },
      { stationCode: 'BZA', arrivalTime: '13:00', departureTime: '13:10', day: 1 }
    ]
  };
  const back = {
    trainNumber: '4',
    trainName: 'Back',
    stops: [
      { stationCode: 'BZA', departureTime: '15:00', day: 1 },
      { stationCode: 'CLX', arrivalTime: '17:00', day: 1 }
    ]
  };

  assert.equal(findConnectingRoutes([south], [north], 'OGL', 'CLX').length, 0);
  assert.equal(findConnectingRoutes([alreadyThere], [back], 'OGL', 'CLX').length, 0);
});

test('does not leave a train that already reaches the destination', () => {
  const through = {
    trainNumber: '1',
    trainName: 'Through',
    stops: [
      { stationCode: 'MAS', departureTime: '12:00', day: 1 },
      { stationCode: 'GDR', arrivalTime: '13:00', departureTime: '13:05', day: 1 },
      { stationCode: 'CLX', arrivalTime: '18:18', day: 1 }
    ]
  };
  const later = {
    trainNumber: '2',
    trainName: 'Later',
    stops: [
      { stationCode: 'GDR', departureTime: '20:44', day: 1 },
      { stationCode: 'CLX', arrivalTime: '02:42', day: 2 }
    ]
  };
  const feeder = {
    trainNumber: '3',
    trainName: 'Feeder',
    stops: [
      { stationCode: 'MAS', departureTime: '16:00', day: 1 },
      { stationCode: 'GDR', arrivalTime: '17:40', day: 1 }
    ]
  };

  assert.equal(findConnectingRoutes([through], [later], 'MAS', 'CLX').length, 0);
  assert.equal(findConnectingRoutes([feeder], [later], 'MAS', 'CLX').length, 1);
});

test('a connection that passes a station already ridden is dropped', () => {
  const out = {
    trainNumber: '1',
    trainName: 'Out',
    stops: [
      { stationCode: 'MAS', departureTime: '08:00', day: 1 },
      { stationCode: 'SA', arrivalTime: '10:00', departureTime: '10:05', day: 1 },
      { stationCode: 'TPJ', arrivalTime: '12:00', departureTime: '12:05', day: 1 }
    ]
  };
  const back = {
    trainNumber: '2',
    trainName: 'Back',
    stops: [
      { stationCode: 'TPJ', departureTime: '14:00', day: 1 },
      { stationCode: 'SA', arrivalTime: '16:00', departureTime: '16:05', day: 1 },
      { stationCode: 'KPD', arrivalTime: '18:00', day: 1 }
    ]
  };
  const feeder = {
    trainNumber: '3',
    trainName: 'Feeder',
    stops: [
      { stationCode: 'MAS', departureTime: '08:00', day: 1 },
      { stationCode: 'AJJ', arrivalTime: '09:00', day: 1 }
    ]
  };
  const onward = {
    trainNumber: '4',
    trainName: 'Onward',
    stops: [
      { stationCode: 'AJJ', departureTime: '11:00', day: 1 },
      { stationCode: 'KPD', arrivalTime: '12:00', day: 1 }
    ]
  };

  const routes = findConnectingRoutes([out], [back], 'MAS', 'KPD');
  assert.deepEqual(routes.map(r => r.connectionStation), ['SA']);
  assert.equal(findConnectingRoutes([feeder], [onward], 'MAS', 'KPD').length, 1);
});

test('a connection off the line is dropped when a train already joins the two stations', () => {
  const line = {
    trainNumber: '9',
    trainName: 'Line',
    stops: [
      { stationCode: 'MAS', departureTime: '06:00', day: 1 },
      { stationCode: 'AJJ', arrivalTime: '07:00', departureTime: '07:05', day: 1 },
      { stationCode: 'KPD', arrivalTime: '08:00', day: 1 }
    ]
  };
  const away = {
    trainNumber: '1',
    trainName: 'Away',
    stops: [
      { stationCode: 'MAS', departureTime: '08:00', day: 1 },
      { stationCode: 'TPJ', arrivalTime: '12:00', departureTime: '12:05', day: 1 }
    ]
  };
  const back = {
    trainNumber: '2',
    trainName: 'Back',
    stops: [
      { stationCode: 'TPJ', departureTime: '14:00', day: 1 },
      { stationCode: 'KPD', arrivalTime: '18:00', day: 1 }
    ]
  };
  const toAjj = {
    trainNumber: '3',
    trainName: 'To',
    stops: [
      { stationCode: 'MAS', departureTime: '09:00', day: 1 },
      { stationCode: 'AJJ', arrivalTime: '10:00', day: 1 }
    ]
  };
  const fromAjj = {
    trainNumber: '4',
    trainName: 'From',
    stops: [
      { stationCode: 'AJJ', departureTime: '12:00', day: 1 },
      { stationCode: 'KPD', arrivalTime: '13:00', day: 1 }
    ]
  };

  assert.equal(findConnectingRoutes([line, away], [back], 'MAS', 'KPD').length, 0);
  assert.equal(findConnectingRoutes([line, toAjj], [fromAjj], 'MAS', 'KPD').length, 1);
});

const stations = [
  { code: 'MAS', name: 'Chennai Central' },
  { code: 'MS', name: 'Chennai Egmore' },
  { code: 'CLX', name: 'Chirala' }
];

test('a sentence reply can only name stations on the list', () => {
  assert.deepEqual(interpret({ from: 'MAS', to: 'Chirala', after: '6pm', trains: ['12043'] }, stations), {
    from: 'MAS',
    to: 'CLX',
    after: '18:00'
  });
  assert.match(interpret({ from: 'XYZ', to: 'CLX', after: null }, stations).error, /station/);
  assert.match(interpret({ from: 'Chennai', to: 'CLX', after: null }, stations).error, /Chennai Central/);
  assert.match(unclearStation('chennai to chirala', stations).error, /Chennai Central/);
  assert.equal(unclearStation('Chennai Central to Chirala', stations), null);
  assert.match(interpret({ from: 'MAS', to: 'CLX', after: '25:99' }, stations).error, /time/);
  assert.match(interpret({ from: 'MAS', to: 'MAS', after: null }, stations).error, /same/);
});

test('a typed trip is read from the words around to and after', () => {
  const { stations: network } = require('../data');
  assert.deepEqual(readSentence('Tirupati Main to Ongole after 11pm', network), {
    from: 'TPTY',
    to: 'OGL',
    after: '23:00'
  });
  assert.deepEqual(readSentence('Chennai Central to Chirala', network), {
    from: 'MAS',
    to: 'CLX',
    after: null
  });
  assert.match(readSentence('chennai to chirala', network).error, /Chennai Central/);
  assert.match(readSentence('Ongole', network).error, /Station to Station/);
});

test('a departure time keeps only trains that leave then or later', () => {
  const direct = [
    { from: { departureTime: '09:00' } },
    { from: { departureTime: '18:00' } }
  ];
  const connecting = [
    { train1: { from: { departureTime: '17:59' } } },
    { train1: { from: { departureTime: '22:10' } } }
  ];
  const kept = filterDepartures(direct, connecting, '18:00');
  assert.deepEqual(kept.direct.map(route => route.from.departureTime), ['18:00']);
  assert.deepEqual(kept.connecting.map(route => route.train1.from.departureTime), ['22:10']);
});

test('saving a trip twice removes it, and a broken trip is refused', () => {
  const trip = {
    type: 'direct',
    trainNumber: '14724',
    from: { stationCode: 'TPTY', departureTime: '23:50' },
    to: { stationCode: 'OGL' }
  };
  const saved = applyBookmark([], trip);
  assert.equal(saved.length, 1);
  assert.equal(saved[0].key, 'direct:14724:TPTY:OGL:23:50');
  assert.equal(applyBookmark(saved, trip).length, 0);
  assert.equal(applyBookmark([], { type: 'direct' }), null);
});

test('a saved trip must be on the timetable', () => {
  const trip = {
    type: 'direct',
    trainNumber: '14724',
    from: { stationCode: 'TPTY', departureTime: '23:50' },
    to: { stationCode: 'OGL', arrivalTime: '03:58' }
  };
  assert.equal(knownTrip(trip), trip);
  assert.equal(knownTrip({ ...trip, trainNumber: '00000' }), null);
  assert.equal(knownTrip({ ...trip, to: { stationCode: 'OGL', arrivalTime: '03:59' } }), null);
  const change = {
    type: 'connecting',
    connectionStation: 'GDR',
    train1: {
      trainNumber: '12669',
      from: { stationCode: 'MAS', departureTime: '17:40' },
      to: { stationCode: 'GDR', arrivalTime: '19:23' }
    },
    train2: {
      trainNumber: '12615',
      from: { stationCode: 'GDR', departureTime: '20:30' },
      to: { stationCode: 'CLX', arrivalTime: '23:13' }
    }
  };
  assert.equal(knownTrip(change), change);
  assert.equal(knownTrip({ ...change, connectionStation: 'OGL' }), null);
});

test('a bookmark request without a token is refused', () => {
  let status = 0;
  const res = {
    status(code) { status = code; return this; },
    json() { return this; }
  };
  requireUser({ headers: {} }, res, () => { throw new Error('open'); });
  assert.equal(status, 401);
});

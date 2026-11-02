const { Train } = require('../models');
const { MIN_LAYOVER, MAX_LAYOVER } = require('../config');
const { timeToMinutes, calculateDuration, formatDuration } = require('../utils');

async function findDirectTrains(fromCode, toCode) {
  const directTrains = await Train.find({ 'stops.stationCode': { $all: [fromCode, toCode] } });
  const results = [];

  directTrains.forEach(train => {
    const stops = train.stops;
    const fromIndex = stops.findIndex(s => s.stationCode === fromCode);
    const toIndex = stops.findIndex(s => s.stationCode === toCode);

    if (fromIndex === -1 || toIndex === -1 || fromIndex >= toIndex) return;

    const fromStop = stops[fromIndex];
    const toStop = stops[toIndex];
    const duration = calculateDuration(fromStop.departureTime, fromStop.day, toStop.arrivalTime, toStop.day);
    if (duration === null || duration < 0) return;

    results.push({
      type: 'direct',
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      from: { stationCode: fromCode, departureTime: fromStop.departureTime, day: fromStop.day },
      to: { stationCode: toCode, arrivalTime: toStop.arrivalTime, day: toStop.day },
      duration,
      durationFormatted: formatDuration(duration),
      intermediateStops: toIndex - fromIndex - 1
    });
  });

  return results.sort((a, b) => a.duration - b.duration);
}

function legResult(train, fromStop, toStop, duration) {
  return {
    trainNumber: train.trainNumber,
    trainName: train.trainName,
    durationFormatted: formatDuration(duration),
    from: { stationCode: fromStop.stationCode, departureTime: fromStop.departureTime, day: fromStop.day },
    to: { stationCode: toStop.stationCode, arrivalTime: toStop.arrivalTime, day: toStop.day }
  };
}

// Stations strictly between from and to on a train that serves both.
// Null when no train serves both, so a real change of line can stay.
function stationsBetween(trains, fromCode, toCode) {
  const between = new Set();
  let onOneLine = false;
  for (const train of trains) {
    const a = train.stops.findIndex(s => s.stationCode === fromCode);
    const b = train.stops.findIndex(s => s.stationCode === toCode);
    if (a === -1 || b === -1 || a >= b) continue;
    onOneLine = true;
    for (let i = a + 1; i < b; i++) between.add(train.stops[i].stationCode);
  }
  return onOneLine ? between : null;
}

function findConnectingRoutes(trainsFromA, trainsToB, fromCode, toCode, minLayover = MIN_LAYOVER, maxLayover = MAX_LAYOVER) {
  const between = stationsBetween(trainsFromA, fromCode, toCode);
  const byTransfer = new Map();

  for (const train of trainsFromA) {
    const fromIdx = train.stops.findIndex(s => s.stationCode === fromCode);
    if (fromIdx === -1) continue;
    if (train.stops.slice(fromIdx + 1).some(s => s.stationCode === toCode)) continue;
    for (let k = fromIdx + 1; k < train.stops.length; k++) {
      const stop = train.stops[k];
      const arrivals = byTransfer.get(stop.stationCode) || [];
      arrivals.push({ train, fromStop: train.stops[fromIdx], arrivalStop: stop });
      byTransfer.set(stop.stationCode, arrivals);
    }
  }

  const results = [];

  for (const train2 of trainsToB) {
    const toIdx = train2.stops.findIndex(s => s.stationCode === toCode);
    if (toIdx === -1) continue;

    for (let k = 0; k < toIdx; k++) {
      const departureStop = train2.stops[k];
      if (departureStop.stationCode === fromCode) continue;
      if (between && !between.has(departureStop.stationCode)) continue;
      const arrivals = byTransfer.get(departureStop.stationCode);
      if (!arrivals) continue;

      for (const leg1 of arrivals) {
        if (leg1.train.trainNumber === train2.trainNumber) continue;

        const fromIdxOn1 = leg1.train.stops.indexOf(leg1.fromStop);
        const transferIdx = leg1.train.stops.indexOf(leg1.arrivalStop);
        const ridden = new Set(leg1.train.stops.slice(fromIdxOn1, transferIdx).map(s => s.stationCode));
        if (train2.stops.slice(k + 1, toIdx).some(s => ridden.has(s.stationCode))) continue;

        const arrMins = timeToMinutes(leg1.arrivalStop.arrivalTime, leg1.arrivalStop.day);
        const depMins = timeToMinutes(departureStop.departureTime, departureStop.day);
        if (arrMins === null || depMins === null) continue;

        const layover = depMins - arrMins;
        if (layover < minLayover || layover > maxLayover) continue;

        const leg1Start = timeToMinutes(leg1.fromStop.departureTime, leg1.fromStop.day);
        const leg2End = timeToMinutes(train2.stops[toIdx].arrivalTime, train2.stops[toIdx].day);
        if (leg1Start === null || leg2End === null) continue;

        const duration1 = arrMins - leg1Start;
        const duration2 = leg2End - depMins;
        if (duration1 < 0 || duration2 < 0) continue;

        const totalDuration = duration1 + layover + duration2;
        results.push({
          type: 'connecting',
          connectionStation: departureStop.stationCode,
          totalDuration,
          totalDurationFormatted: formatDuration(totalDuration),
          layover,
          layoverFormatted: formatDuration(layover),
          train1: legResult(leg1.train, { ...leg1.fromStop, stationCode: fromCode }, { ...leg1.arrivalStop, stationCode: departureStop.stationCode }, duration1),
          train2: legResult(train2, departureStop, train2.stops[toIdx], duration2)
        });
      }
    }
  }

  return results.sort((a, b) => a.totalDuration - b.totalDuration).slice(0, 20);
}

async function findConnectingTrains(fromCode, toCode) {
  const trainsFromA = await Train.find({ 'stops.stationCode': fromCode }).lean();
  const trainsToB = await Train.find({ 'stops.stationCode': toCode }).lean();
  return findConnectingRoutes(trainsFromA, trainsToB, fromCode, toCode);
}

module.exports = { findDirectTrains, findConnectingTrains, findConnectingRoutes };

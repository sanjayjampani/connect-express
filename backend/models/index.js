// models
const mongoose = require('mongoose');

// station schema
const stationSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true },
  state: { type: String, required: true, enum: ['TN', 'KA', 'AP'] }
});

// stop schema
const stopSchema = new mongoose.Schema({
  stationCode: { type: String, required: true, uppercase: true },
  arrivalTime: { type: String, default: null },
  departureTime: { type: String, default: null },
  day: { type: Number, default: 1 }
}, { _id: false });

// train schema
const trainSchema = new mongoose.Schema({
  trainNumber: { type: String, required: true, unique: true },
  trainName: { type: String, required: true },
  stops: { type: [stopSchema], required: true }
});

// indexing for stops
trainSchema.index({ "stops.stationCode": 1 });

const Station = mongoose.model('Station', stationSchema);
const Train = mongoose.model('Train', trainSchema);

module.exports = { Station, Train };

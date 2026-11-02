const { Station, Train } = require('../models');
const { findDirectTrains, findConnectingTrains } = require('../services/search.service');
const { readSentence, filterDepartures } = require('../services/sentence.service');

async function getStations(req, res) {
  try {
    const stations = await Station.find().sort({ name: 1 });
    const trainCount = await Train.countDocuments();
    res.json({ success: true, count: stations.length, trainCount, data: stations });
  } catch (error) {
    console.error('Error fetching stations:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
}

async function searchRoutes(req, res) {
  try {
    const sentence = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    let fromCode;
    let toCode;
    let after = null;

    if (sentence) {
      if (sentence.length > 200) {
        return res.status(400).json({ success: false, error: 'Keep the sentence under 200 characters' });
      }
      const stations = await Station.find().select('code name').lean();
      const parsed = readSentence(sentence, stations);
      if (parsed.error) {
        const status = parsed.status || 400;
        return res.status(status).json({ success: false, error: parsed.error });
      }
      fromCode = parsed.from;
      toCode = parsed.to;
      after = parsed.after;
    } else {
      const { from, to } = req.query;
      if (!from || !to) {
        return res.status(400).json({ success: false, error: 'Both "from" and "to" are required' });
      }
      fromCode = from.toUpperCase();
      toCode = to.toUpperCase();
      if (fromCode === toCode) {
        return res.status(400).json({ success: false, error: 'Source and destination cannot be same' });
      }
    }

    const found = filterDepartures(
      await findDirectTrains(fromCode, toCode),
      await findConnectingTrains(fromCode, toCode),
      after
    );

    res.json({
      success: true,
      from: fromCode,
      to: toCode,
      after,
      directCount: found.direct.length,
      connectingCount: found.connecting.length,
      results: found
    });
  } catch (error) {
    console.error('Error in search:', error);
    res.status(500).json({ success: false, error: 'Server error during search' });
  }
}

module.exports = { getStations, searchRoutes };

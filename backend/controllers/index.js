const { Station } = require('../models');
const { findDirectTrains, findConnectingTrains } = require('../services/search.service');

async function getStations(req, res) {
  try {
    const stations = await Station.find().sort({ name: 1 });
    res.json({ success: true, count: stations.length, data: stations });
  } catch (error) {
    console.error('Error fetching stations:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
}

async function searchRoutes(req, res) {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ success: false, error: 'Both "from" and "to" are required' });
    }

    const fromCode = from.toUpperCase();
    const toCode = to.toUpperCase();

    if (fromCode === toCode) {
      return res.status(400).json({ success: false, error: 'Source and destination cannot be same' });
    }

    const direct = await findDirectTrains(fromCode, toCode);
    const connecting = await findConnectingTrains(fromCode, toCode);

    res.json({
      success: true,
      from: fromCode,
      to: toCode,
      directCount: direct.length,
      connectingCount: connecting.length,
      results: { direct, connecting }
    });
  } catch (error) {
    console.error('Error in search:', error);
    res.status(500).json({ success: false, error: 'Server error during search' });
  }
}

module.exports = { getStations, searchRoutes };

const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const trains = require('../data/trains.json');

const BOOKMARK_LIMIT = 20;

function bookmarkKey(route) {
  if (!route || (route.type !== 'direct' && route.type !== 'connecting')) return null;
  const parts = route.type === 'direct'
    ? [route.type, route.trainNumber, route.from && route.from.stationCode, route.to && route.to.stationCode, route.from && route.from.departureTime]
    : [route.type, route.train1 && route.train1.trainNumber, route.train2 && route.train2.trainNumber, route.connectionStation, route.train2 && route.train2.from && route.train2.from.departureTime];
  if (parts.some(part => part == null || part === '')) return null;
  return parts.join(':');
}

function stopIndex(stops, code, field, time) {
  if (!code || !time) return -1;
  return stops.findIndex(stop => stop.stationCode === code && stop[field] === time);
}

function knownTrip(route) {
  if (!route) return null;
  const train = (number) => trains.find(item => item.trainNumber === number);
  if (route.type === 'direct') {
    const row = train(route.trainNumber);
    if (!row) return null;
    const fromIdx = stopIndex(row.stops, route.from && route.from.stationCode, 'departureTime', route.from && route.from.departureTime);
    const toIdx = stopIndex(row.stops, route.to && route.to.stationCode, 'arrivalTime', route.to && route.to.arrivalTime);
    if (fromIdx === -1 || toIdx <= fromIdx) return null;
    return route;
  }
  if (route.type !== 'connecting' || !route.train1 || !route.train2) return null;
  const first = train(route.train1.trainNumber);
  const second = train(route.train2.trainNumber);
  if (!first || !second) return null;
  const fromIdx = stopIndex(first.stops, route.train1.from && route.train1.from.stationCode, 'departureTime', route.train1.from && route.train1.from.departureTime);
  const mid1 = stopIndex(first.stops, route.connectionStation, 'arrivalTime', route.train1.to && route.train1.to.arrivalTime);
  const mid2 = stopIndex(second.stops, route.connectionStation, 'departureTime', route.train2.from && route.train2.from.departureTime);
  const toIdx = stopIndex(second.stops, route.train2.to && route.train2.to.stationCode, 'arrivalTime', route.train2.to && route.train2.to.arrivalTime);
  if (fromIdx === -1 || mid1 <= fromIdx || mid2 === -1 || toIdx <= mid2) return null;
  return route;
}

function applyBookmark(bookmarks, route) {
  const key = bookmarkKey(route);
  if (!key) return null;
  const list = Array.isArray(bookmarks) ? bookmarks : [];
  const without = list.filter(item => item.key !== key);
  if (without.length !== list.length) return without;
  return [{ key, route }, ...without].slice(0, BOOKMARK_LIMIT);
}

function requireUser(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ success: false, message: 'Sign in to save a trip' });
  try {
    req.userId = jwt.verify(token, JWT_SECRET).id;
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Sign in to save a trip' });
  }
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    bookmarks: user.bookmarks || []
  };
}

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered securely!',
      token,
      user: publicUser(user)
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: publicUser(user)
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.bookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('bookmarks');
    if (!user) return res.status(401).json({ success: false, message: 'Sign in to save a trip' });
    res.json({ success: true, bookmarks: user.bookmarks || [] });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.toggleBookmark = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('bookmarks');
    if (!user) return res.status(401).json({ success: false, message: 'Sign in to save a trip' });
    const bookmarks = applyBookmark(user.bookmarks, knownTrip(req.body && req.body.route));
    if (!bookmarks) return res.status(400).json({ success: false, message: 'That trip cannot be saved' });
    await User.updateOne({ _id: req.userId }, { $set: { bookmarks } });
    res.json({ success: true, bookmarks });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.bookmarkKey = bookmarkKey;
exports.applyBookmark = applyBookmark;
exports.knownTrip = knownTrip;
exports.requireUser = requireUser;

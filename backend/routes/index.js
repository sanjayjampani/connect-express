const express = require('express');
const router = express.Router();
const { getStations, searchRoutes } = require('../controllers');
const authRoutes = require('./auth.routes');

router.get('/stations', getStations);
router.get('/search', searchRoutes);
router.use('/auth', authRoutes);

module.exports = router;

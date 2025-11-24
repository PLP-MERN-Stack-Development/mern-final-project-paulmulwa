const express = require('express');
const router = express.Router();
const regionController = require('../controllers/region.controller');

// Public routes
router.get('/', regionController.getAllRegions);
router.get('/counties/list', regionController.getCountiesList);
router.get('/:county', regionController.getRegionByCounty);
router.get('/:county/constituencies', regionController.getConstituenciesByCounty);
router.get('/:county/:constituency/wards', regionController.getWardsByConstituency);

module.exports = router;

const kenyaAreasAPI = require('../services/kenyaAreasAPI');

// @desc    Get all regions
// @route   GET /api/regions
// @access  Public
exports.getAllRegions = async (req, res, next) => {
  try {
    const data = await kenyaAreasAPI.getAllAreas();

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get region by county
// @route   GET /api/regions/:county
// @access  Public
exports.getRegionByCounty = async (req, res, next) => {
  try {
    const { county } = req.params;
    const data = await kenyaAreasAPI.getAreasByCounty(county);

    if (!data[county]) {
      return res.status(404).json({
        success: false,
        message: 'County not found'
      });
    }

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get constituencies by county
// @route   GET /api/regions/:county/constituencies
// @access  Public
exports.getConstituenciesByCounty = async (req, res, next) => {
  try {
    const { county } = req.params;
    const constituencies = await kenyaAreasAPI.getConstituenciesByCounty(county);

    res.json({
      success: true,
      count: constituencies.length,
      data: constituencies
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get wards by constituency
// @route   GET /api/regions/:county/:constituency/wards
// @access  Public
exports.getWardsByConstituency = async (req, res, next) => {
  try {
    const { county, constituency } = req.params;
    const wards = await kenyaAreasAPI.getWardsForConstituency(county, constituency);

    res.json({
      success: true,
      count: wards.length,
      data: wards
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get counties list
// @route   GET /api/regions/counties/list
// @access  Public
exports.getCountiesList = async (req, res, next) => {
  try {
    const counties = await kenyaAreasAPI.getAllCounties();

    res.json({
      success: true,
      count: counties.length,
      data: counties
    });
  } catch (error) {
    next(error);
  }
};

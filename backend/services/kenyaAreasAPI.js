const https = require('https');

const API_BASE_URL = 'https://kenyaareadata.vercel.app/api/areas';
const API_KEY = 'keyPub1569gsvndc123kg9sjhg';

/**
 * Make a request to the Kenya Areas Data API
 * @param {string} endpoint - The endpoint path with query parameters
 * @returns {Promise<Object>} - The parsed JSON response
 */
const makeRequest = (endpoint) => {
  return new Promise((resolve, reject) => {
    const url = `${endpoint}${endpoint.includes('?') ? '&' : '?'}apiKey=${API_KEY}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          
          // Check for API errors
          if (parsedData.error) {
            reject(new Error(parsedData.error));
          } else {
            resolve(parsedData);
          }
        } catch (error) {
          reject(new Error('Failed to parse API response'));
        }
      });
    }).on('error', (err) => {
      reject(new Error(`API request failed: ${err.message}`));
    });
  });
};

/**
 * Get all areas (counties, constituencies, and wards)
 * @returns {Promise<Object>} - All Kenya administrative areas
 */
exports.getAllAreas = async () => {
  try {
    const data = await makeRequest(API_BASE_URL);
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch all areas: ${error.message}`);
  }
};

/**
 * Get areas by county
 * @param {string} county - The county name
 * @returns {Promise<Object>} - Constituencies and wards for the county
 */
exports.getAreasByCounty = async (county) => {
  try {
    const endpoint = `${API_BASE_URL}?county=${encodeURIComponent(county)}`;
    const data = await makeRequest(endpoint);
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch areas for county ${county}: ${error.message}`);
  }
};

/**
 * Get wards by constituency
 * @param {string} county - The county name
 * @param {string} constituency - The constituency name
 * @returns {Promise<Object>} - Wards for the constituency
 */
exports.getWardsByConstituency = async (county, constituency) => {
  try {
    const endpoint = `${API_BASE_URL}?county=${encodeURIComponent(county)}&constituency=${encodeURIComponent(constituency)}`;
    const data = await makeRequest(endpoint);
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch wards for ${constituency}, ${county}: ${error.message}`);
  }
};

/**
 * Get list of all counties
 * @returns {Promise<Array>} - Array of county names
 */
exports.getAllCounties = async () => {
  try {
    const data = await makeRequest(API_BASE_URL);
    return Object.keys(data).sort();
  } catch (error) {
    throw new Error(`Failed to fetch counties: ${error.message}`);
  }
};

/**
 * Get constituencies for a county
 * @param {string} county - The county name
 * @returns {Promise<Array>} - Array of constituency names
 */
exports.getConstituenciesByCounty = async (county) => {
  try {
    const data = await makeRequest(`${API_BASE_URL}?county=${encodeURIComponent(county)}`);
    const countyData = data[county];
    
    if (!countyData) {
      throw new Error(`County ${county} not found`);
    }
    
    return Object.keys(countyData).sort();
  } catch (error) {
    throw new Error(`Failed to fetch constituencies for ${county}: ${error.message}`);
  }
};

/**
 * Get wards for a constituency
 * @param {string} county - The county name
 * @param {string} constituency - The constituency name
 * @returns {Promise<Array>} - Array of ward names
 */
exports.getWardsForConstituency = async (county, constituency) => {
  try {
    const data = await makeRequest(`${API_BASE_URL}?county=${encodeURIComponent(county)}&constituency=${encodeURIComponent(constituency)}`);
    const countyData = data[county];
    
    if (!countyData) {
      throw new Error(`County ${county} not found`);
    }
    
    const wards = countyData[constituency];
    
    if (!wards) {
      throw new Error(`Constituency ${constituency} not found in ${county}`);
    }
    
    return wards.sort();
  } catch (error) {
    throw new Error(`Failed to fetch wards: ${error.message}`);
  }
};

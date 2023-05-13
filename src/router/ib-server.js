const express = require('express');
const {
  getLiveSessionToken,
  getPortfolioPosition,
  getPortfolioPositionAPI,
} = require('../controller/ib-controller');
const router = express.Router();

// Define routes for the sample router
router.get('/live_session_token', getLiveSessionToken);

router.post('/portfolio', getPortfolioPosition);

router.post('/portfolio_api', getPortfolioPositionAPI);



// Export the router
module.exports = router;

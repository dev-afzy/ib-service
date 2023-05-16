const express = require('express');
const {
  getLiveSessionToken,
  getPortfolioPosition,
} = require('../controller/ib-controller');
const router = express.Router();

// Define routes for the sample router
router.get('/live_session_token', getLiveSessionToken);

router.post('/portfolio', getPortfolioPosition);

// Export the router
module.exports = router;

const AuthService = require('../service/ib-service');

// Service instance
const authService = new AuthService();

module.exports = {
  async getLiveSessionToken(req, res, next) {
    try {
      const response = await authService.liveSessionTokenRequest();
      if (response) {
        return res.status(200).send(response);
      }
      return res.status(400).send({ data: 'invalid liveSessionTokenRequest' });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ error });
    }
  },

  async getPortfolioPosition(req, res, next) {
    try {
      console.log('test')
      const response = await authService.getPortfolioPositionService(req.body);
      if (response) {
        return res.status(200).send(response);
      }
      return res.status(400).send({ data: 'invalid getPortfolio' });
    } catch (error) {
      return res.status(400).send({ error });
    }
  },

  async getPortfolioPositionAPI(req, res, next) {
    try {
      console.log('test')
      const response = await authService.getPortfolioPositionServiceAPI(req.body);
      if (response) {
        return res.status(200).send(response);
      }
      return res.status(400).send({ data: 'invalid getPortfolio' });
    } catch (error) {
      return res.status(400).send({ error });
    }
  },
};

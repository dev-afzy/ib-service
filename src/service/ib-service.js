const axios = require('axios');
const {
  IB_KEYS,
  IB_CREDENTIAL,
  IB_OAUTH,
  IB_SESSION_KEY,
} = require('../utilities/constant');
const { encrypt, decrypt } = require('../utilities/encryption');
const ibOauth = require('../utilities/IB/oauth');

module.exports = class IBService {
  async liveSessionTokenRequest() {
    const response = await ibOauth.liveSessionTokenRequest();
    const tokenDetails = {
      accessToken: IB_CREDENTIAL.accessToken,
      consKey: IB_CREDENTIAL.consKey,
      liveSessionToken: response.live_session_token,
      realm: IB_CREDENTIAL.realm,
      lstBigInt: IB_CREDENTIAL.lstBigInt,
      useGw: IB_SESSION_KEY.useGw,
    };

    return {
      live_session_token: encrypt(JSON.stringify(tokenDetails)),
      // live_session_token: response.live_session_token,
      live_session_token_expiration: response.live_session_token_expiration,
    };
  }

  async getPortfolioPositionService(body) {
    try {
      const response = await ibOauth.getPortfolioDetails(body);
      console.log('response===>', response);
      return response || [];
    } catch (error) {
      return new Error(error);
    }
  }
};

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

  async getPortfolioPositionServiceAPI(body) {
    try {
      // const response = await ibOauth.getPortfolioDetails(body);
      // console.log('response===>', response);
      var config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://api.ibkr.com/v1/api/portfolio/U7221164/positions/0',
        headers: {
          authorization:
            'OAuth realm="limited_poa", oauth_consumer_key="JAYKPATEL", oauth_nonce="af4DGpcj64tUTggP30JLbjxUN7Epr8os", oauth_signature="TRkrArfxQU7p35RPmoxHtKkohvfdRIePRnQDtSgx4AU%3D", oauth_signature_method="HMAC-SHA256", oauth_timestamp="1683997956", oauth_token="19061359ff8afa41d113"',
        },
      };

      const response = await axios(config);
        // .then(function (response) {
        //   console.log(JSON.stringify(response.data));
        //   return response;
        // })
        // .catch(function (error) {
        //   console.log(error);
        // });
      return response.data;
    } catch (error) {
      return new Error(error);
    }
  }
};

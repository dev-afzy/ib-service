const NodeRSA = require('node-rsa');
const crypto = require('crypto');
const bigInteger = require('big-integer');
const { calculateLST, verifyLST } = require('./oauth.utils');
const OauthControllers = require('./oath.controllers');
const { decrypt } = require('../encryption');
const { IB_SESSION_KEY } = require('../constant');

class IbOauth extends OauthControllers {
  deviceId = undefined;
  constructor() {
    super();
  }

  /**
   * Generates a live session token request.
   */
  liveSessionTokenRequest() {
    return new Promise((resolve, reject) => {
      try {
        // Generate a random string
        var dhRandom = crypto.randomBytes(25).toString('hex');

        // Calculate diffieAlgo using the Diffie-Hellman algorithm
        const diffieAlgo = bigInteger(this.keys.generator).modPow(
          bigInteger(dhRandom, 16),
          bigInteger(this.keys.prime, 16)
        );

        // Log the values of dhRandom and diffieAlgo
        console.log('a: ' + dhRandom.toString());
        console.log('diffieAlgo: ' + diffieAlgo.toString());

        // Get the options for the live session token request
        const options = this.getOptions('/oauth/live_session_token');

        // Set the deviceId and access token in the options
        var deviceId = this.deviceId;
        options.accessToken = this.credentials.accessToken;

        // Set the Diffie-Hellman challenge in the options
        options.diffieHellmanChallenge = diffieAlgo.toString(16);
        console.log(options.diffieHellmanChallenge);

        // Create a NodeRSA instance and decrypt the token secret
        const key = new NodeRSA(this.keys.privateEncryptionKey);
        key.setOptions({
          encryptionScheme: 'pkcs1',
        });
        var prepend = key.decrypt(this.oauth.tokenSecret, 'hex');

        // Set the prepend value in the options
        options.prepend = prepend;
        console.log('secret: ' + prepend);

        // Make an OAuth request to generate the live session token
        this.oauthRequest(options, 'liveSessionToken', 'POST', {
          device_id: deviceId,
        }).then(
          function (res) {
            // If the diffie_hellman_response is empty, display an error message and return
            if (res.diffie_hellman_response == '') {
              console.log('Please retry live session token generation!');
              return;
            }

            // Calculate the live session token (lst) using the diffie_hellman_response, dhRandom, prepend, and this.keys.prime
            let lst = calculateLST(
              res.diffie_hellman_response,
              dhRandom,
              Buffer.from(prepend, 'hex'),
              this.keys.prime
            );

            // Update the credentials with the live session token (lst)
            this.credentials.liveSessionToken = lst;
            res.live_session_token = lst;
            this.credentials.lstBigInt = bigInteger(
              Buffer.from(lst, 'base64').toString('hex'),
              16
            );

            // Log the value of lst and verify its integrity
            console.log('lst', lst);
            console.log(
              'verify lst',
              verifyLST(lst, options.consKey, res.live_session_token_signature)
            );
            resolve(res);
          }.bind(this)
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  async getPortfolioDetails(body) {
    try {
      const { live_session_token, page_id = 0, account_id } = body;
      const decrypted = decrypt(live_session_token);
      console.log(decrypted);
      const options = JSON.parse(decrypted);
      options.endPoint = `/portfolio/${account_id}/positions/${page_id}`;
      const data = await this.apiGet(
        options,
        IB_SESSION_KEY.baseUrl
      );
      return data;
    } catch (error) {
      throw new error();
    }
  }
}

const ibOauth = new IbOauth();
module.exports = ibOauth;

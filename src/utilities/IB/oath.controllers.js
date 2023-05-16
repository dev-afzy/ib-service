const fetch = require('node-fetch');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const {
  IB_CREDENTIAL,
  IB_SESSION_KEY,
  IB_KEYS,
  IB_OAUTH,
} = require('../constant');
const { objectBodyToPayload } = require('./oauth.utils');
const { resolve } = require('path');

const Headers = fetch.Headers;

class OauthControllers {
  keys = IB_KEYS;
  credentials = IB_CREDENTIAL;
  session = IB_SESSION_KEY;
  oauth = IB_OAUTH;
  constructor() {}

  async apiGet(endPoint, baseUrlOverride) {
    var options = this.getOptions(endPoint);
    options.endPoint.key = options.endPoint.liveSessionToken;
    if (baseUrlOverride) {
      options.endPoint.url = baseUrlOverride + endPoint.endPoint;
    }
    return new Promise((resolve, reject) => {
      this.sendProtectedResourceRequest(options.endPoint, 'GET', {})
        .then((res) => resolve(res))
        .catch((res) => reject(res));
    });
  }

  async sendProtectedResourceRequest(options, method, body, bodyType) {
    return new Promise((resolve, reject) => {
      console.log("options===>", options)
      this.oauthRequest(options, 'protectedResource', method, body, bodyType)
        .then((res) => resolve(res))
        .catch((err) => reject(err));
    });
  }

  /**
   * Creates and returns options for an API request.
   * @param {string} endPoint - The endpoint for the API request.
   * @returns {Object} - The options object for the API request.
   */
  getOptions(endPoint) {
    // Create a copy of the credentials object
    const options = { ...this.credentials };

    // Set the 'useGw' property in the options
    options.useGw = this.session.useGw;

    // If an endpoint is provided, set the 'endPoint' and 'url' properties in the options
    if (endPoint) {
      options.endPoint = endPoint;
      options.url = this.session.baseUrl + endPoint;
    }

    // Return the options object
    return options;
  }

  /**
   * Makes an OAuth authenticated request.
   *
   * @param {object} options - The options for the OAuth request.
   * @param {string} requestType - The type of the OAuth request (e.g., 'protectedResource', 'requestToken', 'accessToken', 'sso').
   * @param {string} httpMethod - The HTTP method for the request (e.g., 'GET', 'POST', 'PUT').
   * @param {object} requestBody - The request body data.
   * @param {string} bodyType - The type of the request body ('urlencoded', 'json').
   * @returns {Promise} - A Promise that resolves to the response data or rejects with an error.
   */
  oauthRequest(options, requestType, httpMethod, requestBody, bodyType) {
    var signatureMethod = '';
    // Determine the signature method and key based on the request type
    if (requestType == 'protectedResource') {
      options.key = options.liveSessionToken;
      signatureMethod = 'HMAC-SHA256';
    } else {
      options.key = this.keys.privateSigningKey;
      signatureMethod = 'RSA-SHA256';
    }
    return new Promise(function (resolve, reject) {
      // Create an OAuth instance
      const oauth = OAuth({
        consumer: {
          key: options.consKey,
        },
        realm: options.realm,
        signature_method: signatureMethod,
        hash_function(key, base_string) {
          if (signatureMethod == 'HMAC-SHA256') {
            return crypto
              .createHmac('sha256', key)
              .update(base_string)
              .digest('base64');
          } else {
            var sign = crypto.createSign('RSA-SHA256');
            sign.update(base_string);
            return sign.sign(key, 'base64');
          }
        },
        getSignature(request_data, key, oauth_data) {
          var buff_key = key;
          if (signatureMethod == 'HMAC-SHA256') {
            buff_key = Buffer.from(key, 'base64');
          }
          var base = this.getBaseString(request_data, oauth_data);
          // Modify the base string to handle specific encoding requirements
          base = base.replace(/%257C/g, '%7C'); // We need | to encode to %7C and not %257C
          base = base.replace(/%252C/g, '%2C'); // Encoding market data ','
          base = base.replace(/%253A/g, '%3A'); // Encoding ':'
          if (options.prepend) {
            base = options.prepend + base;
          }
          console.log('signature base', base);
          return this.hash_function(buff_key, base);
        },
      });

      console.log('oauth--->', oauth);
      // Override the getSignature function to handle the signature calculation
      oauth.getSignature = function (request_data, key, oauth_data) {
        var buff_key = key;
        if (signatureMethod == 'HMAC-SHA256') {
          buff_key = Buffer.from(key, 'base64');
        }
        var base = this.getBaseString(request_data, oauth_data);
        // Modify the base string to handle specific encoding requirements
        base = base.replace(/%257C/g, '%7C'); // We need | to encode to %7C and not %257C
        base = base.replace(/%252C/g, '%2C'); // Encoding market data ','
        base = base.replace(/%253A/g, '%3A'); // Encoding ':'
        if (options.prepend) {
          base = options.prepend + base;
        }
        console.log('signature base', base);
        return this.hash_function(buff_key, base);
      };

      // Override the toHeader function to generate the Authorization header
      oauth.toHeader = function (oauth_data) {
        var sorted = this.sortObject(oauth_data);
        console.log('oauth_data===>', oauth_data);
        console.log('sorted===>', sorted);
        var header_value = 'OAuth ';
        if (this.realm) {
          header_value +=
            'realm="' + this.realm + '"' + this.parameter_seperator;
        }
        if (oauth_data.diffie_hellman_challenge) {
          header_value +=
            'diffie_hellman_challenge="' +
            oauth_data.diffie_hellman_challenge +
            '"' +
            this.parameter_seperator;
        }
        for (var i = 0; i < sorted.length; i++) {
          if (sorted[i].key.indexOf('oauth_') !== 0) continue;
          header_value +=
            this.percentEncode(sorted[i].key) +
            '="' +
            this.percentEncode(sorted[i].value) +
            '"' +
            this.parameter_seperator;
        }
        return {
          Authorization: header_value.substr(
            0,
            header_value.length - this.parameter_seperator.length
          ), // Cut the last characters
        };
      };

      const oauth_data = {
        oauth_consumer_key: options.consKey,
        oauth_nonce: oauth.getNonce(),
        oauth_signature_method: oauth.signature_method,
        oauth_timestamp: oauth.getTimeStamp(),
      };

      // Set additional OAuth data based on the request type
      if (requestType == 'requestToken') {
        oauth_data.oauth_callback = 'oob';
      } else if (requestType == 'accessToken') {
        oauth_data.oauth_token = options.requestToken;
        oauth_data.oauth_verifier = options.verifier;
      } else if (requestType != 'requestToken') {
        oauth_data.oauth_token = options.accessToken;
      }
      if (options.diffieHellmanChallenge) {
        oauth_data.diffie_hellman_challenge = options.diffieHellmanChallenge;
      }

      // Construct the request data object
      const request_data = {
        url: options.url,
        method: httpMethod,
      };

      // Set the request body based on the body type
      if (!bodyType || bodyType == 'urlencoded') {
        request_data.data = requestBody;
      }
      console.log('request_data', request_data);
      console.log('oauth_data', oauth_data);

      // Calculate the OAuth signature
      oauth_data.oauth_signature = oauth.getSignature(
        request_data,
        options.key,
        oauth_data
      );
      if (bodyType == 'json') {
        request_data.data = requestBody;
      }
      //Don't include payload in base string calculation
      const request_body = {
        method: request_data.method,
      };

      // Set the request headers based on the OAuth data
      if (!options.useGw) {
        request_body.headers = new Headers();
        const res = oauth.toHeader(oauth_data);
        request_body.headers.append(
          'authorization',
          res.Authorization
          // 'OAuth realm="limited_poa", oauth_consumer_key="JAYKPATEL", oauth_nonce="af4DGpcj64tUTggP30JLbjxUN7Epr8os", oauth_signature="TRkrArfxQU7p35RPmoxHtKkohvfdRIePRnQDtSgx4AU%3D", oauth_signature_method="HMAC-SHA256", oauth_timestamp="1683997956", oauth_token="19061359ff8afa41d113"'
        );
      } else {
        request_body.headers = new Headers();
      }

      // Set the request body and content type headers based on the request data
      if (requestBody) {
        if (httpMethod == 'POST' || httpMethod == 'PUT') {
          if (bodyType == 'json') {
            request_body.body = JSON.stringify(request_data.data);
            request_body.headers.append('Content-Type', 'application/json');
          } else {
            request_body.body = objectBodyToPayload(
              oauth.sortObject(request_data.data)
            );
            request_body.headers.append(
              'Content-Type',
              'application/x-www-form-urlencoded'
            );
          }
        }
      }

      // Handle special case for 'sso' request type
      if (requestType == 'sso') {
        request_body.body = JSON.stringify(requestBody);
        request_body.headers.append('Content-Type', 'application/json');
      }
      request_body.credentials = 'include';

      console.log(
        'sending oauth ' + httpMethod + ' request ' + request_data.url
      );

      // Make the OAuth authenticated request using the Fetch API
      return fetch(request_data.url, request_body)
        .then(function (res) {
          console.log('res====>', res);
          if (res.status == 200) {
            res.json().then(function (data) {
              console.log('Data====>', data);
              resolve(data);
            });
          } else {
            reject(res);
          }
        })
        .catch(function (err) {
          console.log('error===>', err);
          reject(err);
        });
    });
  }
}

module.exports = OauthControllers;

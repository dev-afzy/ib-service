const fs = require('fs');
const path = require('path');

console.log(
  path.join(__dirname, '../../serviceKeys/oAuthKeys/private_encryption.pem')
);
const privateEncryptionKey = fs.readFileSync(
  path.join(__dirname, '../../serviceKeys/oAuthKeys/private_encryption.pem'),
  { encoding: 'utf8' }
);
const privateSigningKey = fs.readFileSync(
  path.join(__dirname, '../../serviceKeys/oAuthKeys/private_signature.pem'),
  { encoding: 'utf8' }
);

const IB_KEYS = {
  generator: 2,
  privateSigningKey: privateSigningKey,
  privateEncryptionKey: privateEncryptionKey,
  prime:
    'A696AA9042E24296BBA77AEE6D7A757284A6467FC254D1E0515FE1E1E1BEA8D200801586F54095A81F01090A7468F50E90FDCFA3DD0DEF54A784F5B0BF1A55671C06EA577F9E7411141B626287E74242225887FC785C89C21AEEC866686E70E96768AD5B520EE2FF8C70A014520194697E1783A8C2E31371CA907E4C3A028426E601A4D43EE7EA6178B05F1AFAFA4AFFA408D70E93DFA5F2468A581FE8C9CDA7167D68E89B71F122EC136BFFF22662A82780FC33BDA9634EF09638E69BF8678A8BC656D3BD43B7FE3BB97AA452688B39253BEA7F167B2BA940ACCA1BCB4B2F63CFCD9A9875954112F90056F90199E129B2F6D8BFA4FF8A8306DB307A13F74873',
};

const IB_CREDENTIAL = {
  consKey: 'JAYKPATEL',
  realm: 'limited_poa',
  accessToken: '19061359ff8afa41d113',
  liveSessionToken: '',
};

const IB_OAUTH = {
  requestToken: '',
  verifier: '',
  tokenSecret:
    'HPKfT/KIZGC9gY6pkswIQhquacnJN6U81ttkNF9sQGt9kk4Jtnp6OldhRNzKPwPPWFT17LBnbyo28xZhrV18/znt9qGsgPFPc/+7BZ8xcJEbR3bAkVVN2aDV2yNhvWJMkasf7Uix4yBrkCvAAP0/tjs9YrYFMjKuRc7MNUYgdk2BGVy9De22ghCIz3PZNEHw75bNOD1zhPb4TAaPBHJjpl8hX4vAiCtXvZXn5cK51iC491ldjNkRwVw83QQZL6Ijd6SgqBSaciLBT3U5OdIcwJGJQOJRdAzttJKGmEFv6SoPmbMFqXFJx7jATuQyRbfRmSDNL4ojIwU0Z2OQBZp32w==',
};

const IB_SESSION_KEY = {
  isDev: false,
  useGw: false,
  baseUrl: 'https://api.ibkr.com/v1/api',
  // baseUrl2: ' https://api.ibkr.com/alpha/api',
  gwBaseUrl: 'https://localhost:5000/v1/api',
};

const CRYPTO = {
  KEY: '83f3b6c08b0637f44cc846955f43d161dd6ca9f9b0b0e8e4067f2bf015acf07e',
  IV: '3a9e9b6fddc10528ce22b54865a69cf4',
};
const IB_BASE_URL = IB_SESSION_KEY.useGw
  ? IB_SESSION_KEY.gwBaseUrl
  : IB_SESSION_KEY.baseUrl;
module.exports = {
  IB_KEYS,
  IB_CREDENTIAL,
  IB_OAUTH,
  IB_SESSION_KEY,
  IB_BASE_URL,
  CRYPTO,
};

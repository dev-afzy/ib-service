const bigInteger = require('big-integer');
const crypto = require('crypto');

function objectBodyToPayload(body) {
  var payload = '';
  for (var i = 0; i < body.length; i++) {
    const key = body[i].key;
    const value = body[i].value;
    if (value && Array.isArray(value)) {
      var valString = '';
      value.forEach(
        function (item, i) {
          valString += key + '=' + item;
          if (i < value.length) {
            valString += '&';
          }
        }.bind(this)
      );
      payload += valString;
    } else {
      payload += key + '=' + value + '&';
    }
  }
  payload = payload.substr(0, payload.length - 1);
  return payload;
}

/**
 * Converts a number to a byte array.
 *
 * @param {number} x - The number to convert.
 * @returns {number[]} - The byte array representation of the number.
 * @desc  his function takes a number x and converts it to a byte array representation. It first converts the number to a hexadecimal string, ensuring that the string has an even length by padding it with a leading '0' if necessary. Then, it creates an empty byte array. If the binary representation of the number is divisible by 8, it adds a leading 0 byte to the array. Finally, it iterates over the hexadecimal string, converting each pair of characters to a number using the base 16 (hexadecimal) representation, and pushes the numbers to the byte array. The function returns the resulting byte array.
 */

function toByteArray(x) {
  // Convert the number to a hexadecimal string
  var hexString = x.toString(16);

  // Pad the hexadecimal string with a leading '0' if necessary
  if (hexString.length % 2 > 0) {
    hexString = '0' + hexString;
  }

  // Create an empty byte array
  var byteArray = [];

  // Check if the binary representation of the number is divisible by 8
  if (x.toString(2).length % 8 == 0) {
    byteArray.push(0);
  }

  // Iterate over the hexadecimal string and convert each pair of characters to a number
  for (var i = 0; i < hexString.length; i += 2) {
    byteArray.push(parseInt(hexString.slice(i, i + 2), 16));
  }

  // Return the byte array
  return byteArray;
}

/**
 * Calculates the LST (Live Session Token) using the Diffie-Hellman key exchange.
 *
 * @param {string} dhResponse - The DH (Diffie-Hellman) response value as a hexadecimal string.
 * @param {string} dhRandom - The DH random value as a hexadecimal string.
 * @param {string|Buffer} accessTokenSecret - The access token secret as a hexadecimal string or a Buffer.
 * @param {string} prime - The prime value as a hexadecimal string.
 * @returns {string} - The calculated LST as a base64-encoded string.
 */
/**
 * Calculates the LST (Live Session Token) using the Diffie-Hellman key exchange.
 *
 * @param {string} dhResponse - The DH (Diffie-Hellman) response value as a hexadecimal string.
 * @param {string} dhRandom - The DH random value as a hexadecimal string.
 * @param {string|Buffer} accessTokenSecret - The access token secret as a hexadecimal string or a Buffer.
 * @param {string} prime - The prime value as a hexadecimal string.
 * @returns {string} - The calculated LST as a base64-encoded string.
 */
function calculateLST(dhResponse, dhRandom, accessTokenSecret, prime) {
  // Convert the accessTokenSecret to a Buffer if it's a string
  if (typeof accessTokenSecret === 'string') {
    accessTokenSecret = Buffer.from(accessTokenSecret, 'hex');
  }

  // Log the accessTokenSecret
  console.log(accessTokenSecret);

  // Convert the DH response and random values to big integers
  var B = bigInteger(dhResponse, 16);
  var a = bigInteger(dhRandom, 16);

  // Calculate K using the DH key exchange
  var K = B.modPow(a, bigInteger(prime, 16));
  // Create an HMAC object with the SHA1 algorithm and the secret key
  const byteArray = toByteArray(K);
  const buffer = Buffer.from(byteArray);

  // Create an HMAC-SHA1 hash using K as the key and accessTokenSecret as the data
  var hmac = crypto.createHmac('sha1', buffer).update(accessTokenSecret);

  // Return the resulting hash as a base64-encoded string
  return hmac.digest('base64');
}

/**
 * Verifies the Live Session Token (LST) signature.
 *
 * @param {string} lst - The Live Session Token (LST) as a base64-encoded string.
 * @param {string} consumerKey - The consumer key as a UTF-8 string.
 * @param {string} lstSignature - The signature to verify as a hexadecimal string.
 * @returns {boolean} - A boolean indicating whether the LST signature is valid (true) or not (false).
 */
function verifyLST(lst, consumerKey, lstSignature) {
  // Create an HMAC-SHA1 hash using the base64-decoded LST as the key and the consumerKey as the data
  var toVerify = crypto
    .createHmac('sha1', Buffer.from(lst, 'base64'))
    .update(Buffer.from(consumerKey, 'utf8'))
    .digest('hex');

  // Log the toVerify value and lstSignature
  console.log(toVerify);
  console.log(lstSignature);

  // Compare the calculated toVerify value with the lstSignature and return the result
  return toVerify === lstSignature;
}

module.exports = {
  verifyLST,
  toByteArray,
  calculateLST,
  objectBodyToPayload,
};

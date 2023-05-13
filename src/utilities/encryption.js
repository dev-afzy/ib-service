const crypto = require('crypto');
const { CRYPTO } = require('./constant');

const algorithm = 'aes-256-cbc';
// const key = 'b024b2a6-67f4-4333-9997-7e0d2de197ec'; // replace with your own secure key
const key = Buffer.from(CRYPTO.KEY, 'hex'); // 256-bit key
const iv = Buffer.from(CRYPTO.IV, 'hex'); // 256-bit key; // generate a random initialization vector

function encrypt(text) {
  console.log('key--->', { key, iv });
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let cipherText = cipher.update(text, 'utf8', 'hex');
  cipherText += cipher.final('hex');
  return cipherText;
}

function decrypt(encryptedData) {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  console.log('Decrypted:', decrypted);
  return decrypted;
}

module.exports = { encrypt, decrypt };

const crypto = require('crypto');

function generateHash(data) {
  const dataString = JSON.stringify(data);
  return crypto.createHash('sha256').update(dataString).digest('hex');
}

module.exports = { generateHash };

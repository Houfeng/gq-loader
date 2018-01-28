const axios = require('axios');

module.exports = function request(url, data, options) {
  return axios.post(url, data, options);
};
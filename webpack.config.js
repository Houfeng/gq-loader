const path = require('path');

module.exports = function (webpackConf) {
  webpackConf.module.loaders.push({
    test: /\.(gql|graphql)/i,
    loaders: [require.resolve('./lib')]
  });
};
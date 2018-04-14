/**
 * Load config for ENV
 */

const local = require('./config/local');
const production = require('./config/production');

module.exports = {
  load() {
    let config;

    if (process.env.ENV === 'local') {
      config = local;
    } else {
      config = production;
    }

    return config.values;
  },
};

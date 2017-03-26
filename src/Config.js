/**
 * Load config for ENV
 */
export default class Config {
  static load() {
    let config;

    if (process.env.ENV === 'local') {
      config = require('./config/local.js');
    }
    else {
      // default
      config = require('./config/production.js');
    }

    return config.values;
  }
}

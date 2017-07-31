/**
 * Load config for ENV
 */

import local from './config/local';
import production from './config/production';

export default class Config {
  static load() {
    let config;

    if (process.env.ENV === 'local') {
      config = local;
    } else {
      config = production;
    }

    return config.values;
  }
}

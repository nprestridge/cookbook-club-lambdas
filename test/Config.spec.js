const chai = require('chai');
const Config = require('../src/Config');

const local = require('../src/config/local');
const production = require('../src/config/production');

const assert = chai.assert;

describe('src/Config', () => {
  const env = process.env.ENV;

  // Reset env variable
  afterEach(() => {
    process.env.ENV = env;
  });

  describe('load', () => {
    it('should return local config', () => {
      process.env.ENV = 'local';

      const config = Config.load();
      assert.equal(process.env.ENV, 'local');
      assert.deepEqual(config, local.values);
    });

    it('should return prod config as default', () => {
      process.env.ENV = 'production';

      const config = Config.load();
      assert.equal(process.env.ENV, 'production');
      assert.deepEqual(config, production.values);
    });
  });
});

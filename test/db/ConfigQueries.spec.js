const chai = require('chai');
const sinon = require('sinon');
const awsMock = require('aws-sdk-mock');
const ConfigQueries = require('../../src/db/ConfigQueries');

const assert = chai.assert;

describe('src/ConfigQueries', () => {
  const sandbox = sinon.sandbox.create();
  const dynamodb = 'DynamoDB.DocumentClient';

  // Reset test environment
  afterEach(() => {
    awsMock.restore(dynamodb);
    sandbox.restore();
  });

  describe('getSettings', () => {
    it('should return map', async () => {
      const setting = {
        Key: 'Key1',
        Value: 'Value 1',
      };

      const items = {
        Items: [
          setting
        ],
        Count: 1,
        ScannedCount: 1,
      };

      awsMock.mock(dynamodb, 'scan', (params, callback) => {
        callback(null, items);
      });

      const map = await ConfigQueries.getSettings();
      assert.isNotNull(map);
      assert.equal(Object.keys(map).length, 1);
      assert.deepEqual(map[setting.Key], setting.Value);
    });

    it('should return empty map', async () => {
      awsMock.mock(dynamodb, 'scan', (params, callback) => {
        callback(null, {});
      });

      const map = await ConfigQueries.getSettings();
      assert.isNotNull(map);
      assert.deepEqual(map, {});
    });

    it('should return error', async () => {
      sandbox.stub(console, 'error');
      awsMock.mock(dynamodb, 'scan', (params, callback) => {
        callback('Test Error', null);
      });

      const result = await ConfigQueries.getSettings();
      assert.equal(console.error.callCount, 1);
      assert.equal(result, 'Test Error');
    });
  });
});

const chai = require('chai');
const sinon = require('sinon');
const { mockClient } = require('aws-sdk-client-mock');
const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
const ConfigQueries = require('../../src/db/ConfigQueries');

const assert = chai.assert;

describe('src/ConfigQueries', () => {
  let sandbox;
  let dynamoDBMock;

  beforeEach(() => {
    dynamoDBMock = mockClient(DynamoDBClient);
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    dynamoDBMock.reset();
    sandbox.restore();
  });

  describe('getSettings', () => {
    it('should return map', async () => {
      const setting = {
        Key: {
          S: 'Key1',
        },
        Value: {
          S: 'Value 1',
        }
      };

      const items = {
        Items: [
          setting
        ],
        Count: 1,
        ScannedCount: 1,
      };

      dynamoDBMock.on(ScanCommand).resolves(items);

      const map = await ConfigQueries.getSettings();
      assert.isNotNull(map);
      assert.equal(Object.keys(map).length, 1);
      assert.deepEqual(map[setting.Key.S], setting.Value.S);
    });

    it('should return empty map', async () => {
      dynamoDBMock.on(ScanCommand).resolves({});

      const map = await ConfigQueries.getSettings();
      assert.isNotNull(map);
      assert.deepEqual(map, {});
    });

    it('should return error', async () => {
      sandbox.stub(console, 'error');
      dynamoDBMock.on(ScanCommand).rejects('Test Error');

      const result = await ConfigQueries.getSettings();
      assert.equal(console.error.callCount, 1);
      assert.deepEqual(result, {});
    });
  });
});

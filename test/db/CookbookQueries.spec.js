const chai = require('chai');
const sinon = require('sinon');
const { mockClient } = require('aws-sdk-client-mock');
const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
const CookbookQueries = require('../../src/db/CookbookQueries');

const assert = chai.assert;

describe('src/CookbookQueries', () => {
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

  describe('getAll', () => {
    it('should return success', async () => {
      const cookbook1 = {
        Title: {
          S: 'Cookbook 1'
        },
        Author: {
          S: 'Author 1',
        },
      };

      const cookbook2 = {
        Title: {
          S: 'Cookbook 2'
        },
        Author: {
          S: 'Author 2',
        },
      };

      const items = {
        Items: [
          cookbook1,
          cookbook2,
        ],
        Count: 2,
        ScannedCount: 2,
      };
      dynamoDBMock.on(ScanCommand).resolves(items);

      const result = await CookbookQueries.getAll();
      assert.deepEqual(result, items.Items);
    });

    it('should return empty array if no items', async () => {
      dynamoDBMock.on(ScanCommand).resolves({});

      const result = await CookbookQueries.getAll();
      assert.deepEqual(result, []);
    });

    it('should return empty array if error', async () => {
      sandbox.stub(console, 'error');
      dynamoDBMock.on(ScanCommand).rejects('Get Error');

      const result = await CookbookQueries.getAll();
      assert.equal(console.error.callCount, 1);
      assert.deepEqual(result, []);
    });
  });
});

const chai = require('chai');
const sinon = require('sinon');
const { mockClient } = require('aws-sdk-client-mock');
const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
const UserQueries = require('../../src/db/UserQueries');

const assert = chai.assert;

describe('src/UserQueries', () => {
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

  describe('getEmailMap', () => {
    it('should return map', async () => {
      const user1 = {
        Email: {
          S: 'user.1@email.com',
        },
        FirstName: {
          S: 'One'
        },
      };

      const user2 = {
        Email: {
          S: 'user.2@email.com',
        },
        FirstName: {
          S: 'Two',
        },
      };

      const items = {
        Items: [
          user1,
          user2,
        ],
        Count: 2,
        ScannedCount: 2,
      };

      dynamoDBMock.on(ScanCommand).resolves(items);

      const map = await UserQueries.getEmailMap();
      assert.isNotNull(map);
      assert.equal(Object.keys(map).length, 2);
      assert.deepEqual(map[user1.Email.S], user1);
      assert.deepEqual(map[user2.Email.S], user2);
    });

    it('should return empty map', async () => {
      dynamoDBMock.on(ScanCommand).resolves({});

      const map = await UserQueries.getEmailMap();
      assert.isNotNull(map);
      assert.deepEqual(map, {});
    });

    it('should return error', async () => {
      sandbox.stub(console, 'error');
      dynamoDBMock.on(ScanCommand).rejects('Test Error');

      const result = await UserQueries.getEmailMap();
      assert.equal(console.error.callCount, 1);
      assert.deepEqual(result, {});
    });
  });
});

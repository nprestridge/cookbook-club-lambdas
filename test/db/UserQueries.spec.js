const chai = require('chai');
const sinon = require('sinon');
const awsMock = require('aws-sdk-mock');
const UserQueries = require('../../src/db/UserQueries');

const assert = chai.assert;

describe('src/UserQueries', () => {
  const sandbox = sinon.sandbox.create();
  const dynamodb = 'DynamoDB.DocumentClient';

  // Reset test environment
  afterEach(() => {
    awsMock.restore(dynamodb);
    sandbox.restore();
  });

  describe('getEmailMap', () => {
    it('should return map', async () => {
      const user1 = {
        Email: 'user.1@email.com',
        FirstName: 'One',
      };

      const user2 = {
        Email: 'user.2@email.com',
        FirstName: 'Two',
      };

      const items = {
        Items: [
          user1,
          user2,
        ],
        Count: 2,
        ScannedCount: 2,
      };

      awsMock.mock(dynamodb, 'scan', (params, callback) => {
        callback(null, items);
      });

      const map = await UserQueries.getEmailMap();
      assert.isNotNull(map);
      assert.equal(Object.keys(map).length, 2);
      assert.deepEqual(map[user1.Email], user1);
      assert.deepEqual(map[user2.Email], user2);
    });

    it('should return empty map', async () => {
      awsMock.mock(dynamodb, 'scan', (params, callback) => {
        callback(null, {});
      });

      const map = await UserQueries.getEmailMap();
      assert.isNotNull(map);
      assert.deepEqual(map, {});
    });

    it('should return error', async () => {
      sandbox.stub(console, 'error');
      awsMock.mock(dynamodb, 'scan', (params, callback) => {
        callback('Test Error', null);
      });

      const result = await UserQueries.getEmailMap();
      assert.equal(console.error.callCount, 1);
      assert.equal(result, 'Test Error');
    });
  });
});

const chai = require('chai');
const sinon = require('sinon');
const awsMock = require('aws-sdk-mock');
const CookbookQueries = require('../../src/db/CookbookQueries');

const assert = chai.assert;

describe('src/CookbookQueries', () => {
  const sandbox = sinon.sandbox.create();
  const dynamodb = 'DynamoDB.DocumentClient';

  // Reset test environment
  afterEach(() => {
    awsMock.restore(dynamodb);
    sandbox.restore();
  });

  describe('update', () => {
    it('should return success', async () => {
      const item = {
        Title: 'Cookbook',
        Author: 'Author',
      };

      awsMock.mock(dynamodb, 'put', (params, callback) => {
        callback(null);
      });

      const result = await CookbookQueries.update(item);
      assert.equal(result, 'Success');
    });

    it('should return error', async () => {
      sandbox.stub(console, 'error');
      awsMock.mock(dynamodb, 'put', (params, callback) => {
        callback('Update Error', null);
      });

      const result = await CookbookQueries.update();
      assert.equal(result, 'Update Error');
      assert.equal(console.error.callCount, 1, 'console.error.callCount');
    });
  });

  describe('delete', () => {
    it('should return success', async () => {
      awsMock.mock(dynamodb, 'delete', (params, callback) => {
        callback(null);
      });

      const result = await CookbookQueries.delete('Cookbook', 'Author');
      assert.equal(result, 'Success');
    });

    it('should return error', async () => {
      sandbox.stub(console, 'error');
      awsMock.mock(dynamodb, 'delete', (params, callback) => {
        callback('Delete Error', null);
      });

      const result = await CookbookQueries.delete('Cookbook', 'Author');
      assert.equal(console.error.callCount, 1);
      assert.equal(result, 'Delete Error');
    });
  });

  describe('getAll', () => {
    it('should return success', async () => {
      const cookbook1 = {
        Title: 'Cookbook 1',
        Author: 'Author 1',
      };

      const cookbook2 = {
        Title: 'Cookbook 2',
        Author: 'Author 2',
      };

      const items = {
        Items: [
          cookbook1,
          cookbook2,
        ],
        Count: 2,
        ScannedCount: 2,
      };

      awsMock.mock(dynamodb, 'scan', (params, callback) => {
        callback(null, items);
      });

      const result = await CookbookQueries.getAll();
      assert.deepEqual(result, items.Items);
    });

    it('should return empty array if no items', async () => {
      awsMock.mock(dynamodb, 'scan', (params, callback) => {
        callback(null, {});
      });

      const result = await CookbookQueries.getAll();
      assert.deepEqual(result, []);
    });

    it('should return empty array if error', async () => {
      sandbox.stub(console, 'error');
      awsMock.mock(dynamodb, 'scan', (params, callback) => {
        callback('Get Error', null);
      });

      const result = await CookbookQueries.getAll();
      assert.equal(console.error.callCount, 1);
      assert.deepEqual(result, []);
    });
  });
});

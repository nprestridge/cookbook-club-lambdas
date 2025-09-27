const chai = require('chai');
const sinon = require('sinon');
const { mockClient } = require('aws-sdk-client-mock');
const { DynamoDBClient, QueryCommand, ScanCommand } = require('@aws-sdk/client-dynamodb');
const RecipeQueries = require('../../src/db/RecipeQueries');

const { assert } = chai;

// Ensure Mocha globals are available
/* global describe, it, beforeEach, afterEach */

describe('src/RecipeQueries', () => {
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

  describe('getAllByCookbook', () => {
    it('should return recipes', async () => {
      const title = 'Everyday Italian';

      const items = {
        Items: [
          {
            Recipe: {
              S: 'Name 1',
            },
          },
        ],
      };

      dynamoDBMock.on(QueryCommand).resolves(items);

      const result = await RecipeQueries.getAllByCookbook(title);
      assert.deepEqual(result, items.Items);
    });

    it('should return empty array if no recipes', async () => {
      const title = 'Everyday Italian';

      dynamoDBMock.on(QueryCommand).resolves([]);

      const result = await RecipeQueries.getAllByCookbook(title);
      assert.deepEqual(result, []);
    });

    it('should return empty array if error', async () => {
      const title = 'Everyday Italian';

      const errorStub = sandbox.stub(console, 'error');
      dynamoDBMock.on(QueryCommand).rejects('Recipes Error');

      const result = await RecipeQueries.getAllByCookbook(title);
      assert.equal(errorStub.callCount, 1);
      assert.deepEqual(result, []);
    });
  });

  describe('getAll', () => {
    it('should return all recipes', async () => {
      const items = {
        Items: [
          {
            Recipe: {
              S: 'Name 1',
            },
          },
          {
            Recipe: {
              S: 'Name 2',
            },
          },
          {
            Recipe: {
              S: 'Name 3',
            },
          },
        ],
      };

      dynamoDBMock.on(ScanCommand).resolves(items);

      const result = await RecipeQueries.getAll();
      assert.deepEqual(result, items.Items);
    });

    it('should return empty array if no recipes', async () => {
      dynamoDBMock.on(ScanCommand).resolves({});

      const result = await RecipeQueries.getAll();
      assert.deepEqual(result, []);
    });

    it('should return empty array if error', async () => {
      const errorStub = sandbox.stub(console, 'error');
      dynamoDBMock.on(ScanCommand).rejects('Recipes Error');

      const result = await RecipeQueries.getAll();
      assert.equal(errorStub.callCount, 1);
      assert.deepEqual(result, []);
    });
  });
});

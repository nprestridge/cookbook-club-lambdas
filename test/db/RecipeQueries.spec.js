const chai = require('chai');
const sinon = require('sinon');
const awsMock = require('aws-sdk-mock');
const RecipeQueries = require('../../src/db/RecipeQueries');

const assert = chai.assert;

describe('src/RecipeQueries', () => {
  const sandbox = sinon.sandbox.create();
  const dynamodb = 'DynamoDB.DocumentClient';

  // Reset test environment
  afterEach(() => {
    awsMock.restore(dynamodb);
    sandbox.restore();
  });

  describe('hasRecipes', () => {
    it('should return true if there are recipes', async () => {
      const title = 'Everyday Italian';
      const items = {
        Items: [
          {
            Recipe: 'Name 1',
          },
        ],
      };

      awsMock.mock(dynamodb, 'query', (params, callback) => {
        callback(null, items);
      });

      const result = await RecipeQueries.hasRecipes(title);
      assert.isTrue(result);
    });

    it('should return false if there are no associated recipes', async () => {
      const title = 'Everyday Italian';

      awsMock.mock(dynamodb, 'query', (params, callback) => {
        callback(null, {});
      });

      const result = await RecipeQueries.hasRecipes(title);
      assert.isFalse(result);
    });

    it('should return error', async () => {
      const title = 'Everyday Italian';

      sandbox.stub(console, 'error');
      awsMock.mock(dynamodb, 'query', (params, callback) => {
        callback('Query Error', null);
      });

      const result = await RecipeQueries.hasRecipes(title);
      assert.equal(console.error.callCount, 1);
      assert.equal(result, 'Query Error');
    });
  });

  describe('getAllByCookbook', () => {
    it('should return recipes', async () => {
      const title = 'Everyday Italian';

      const items = {
        Items: [
          {
            Recipe: 'Name 1',
          },
        ],
      };

      awsMock.mock(dynamodb, 'query', (params, callback) => {
        callback(null, items);
      });

      const result = await RecipeQueries.getAllByCookbook(title);
      assert.deepEqual(result, items.Items);
    });

    it('should return empty array if no recipes', async () => {
      const title = 'Everyday Italian';

      awsMock.mock(dynamodb, 'query', (params, callback) => {
        callback(null, {});
      });

      const result = await RecipeQueries.getAllByCookbook(title);
      assert.deepEqual(result, []);
    });

    it('should return empty array if error', async () => {
      const title = 'Everyday Italian';

      sandbox.stub(console, 'error');
      awsMock.mock(dynamodb, 'query', (params, callback) => {
        callback('Recipes Error', null);
      });

      const result = await RecipeQueries.getAllByCookbook(title);
      assert.equal(console.error.callCount, 1);
      assert.deepEqual(result, []);
    });
  });

  describe('getRecipesByCookbookParams', () => {
    it('should return query params', () => {
      const title = 'Everyday Italian';
      const expected = {
        TableName: 'Recipe',
        KeyConditionExpression: 'Cookbook = :cookbook',
        ExpressionAttributeValues: {
          ':cookbook': title,
        },
      };

      const result = RecipeQueries.getRecipesByCookbookParams(title);
      assert.deepEqual(result, expected);
    });
  });
});

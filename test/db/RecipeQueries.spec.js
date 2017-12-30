import chai from 'chai';
import sinon from 'sinon';
import Config from '../../src/Config';
import RecipeQueries from '../../src/db/RecipeQueries';

const assert = chai.assert;

const config = Config.load();
const query = new RecipeQueries(config);

describe('src/RecipeQueries', () => {
  const sandbox = sinon.sandbox.create();

  // Reset test environment
  afterEach(() => {
    sandbox.restore();
  });

  describe('hasRecipes', () => {
    it('should return true if there are recipes', async () => {
      const title = 'Everyday Italian';
      const params = RecipeQueries.getRecipesByCookbookParams(title);

      const items = {
        Items: [
          {
            Recipe: 'Name 1',
          },
        ],
      };


      sandbox.stub(query.docClient, 'query')
        .withArgs(params)
        .yields(null, items);

      const result = await query.hasRecipes(title);
      assert.equal(query.docClient.query.callCount, 1);
      assert.isTrue(result);
    });

    it('should return false if there are no associated recipes', async () => {
      const title = 'Everyday Italian';
      const params = RecipeQueries.getRecipesByCookbookParams(title);

      sandbox.stub(query.docClient, 'query')
        .withArgs(params)
        .yields(null, {});

      const result = await query.hasRecipes(title);
      assert.equal(query.docClient.query.callCount, 1);
      assert.isFalse(result);
    });

    it('should return error', async () => {
      const title = 'Everyday Italian';

      sandbox.stub(console, 'error');
      sandbox.stub(query.docClient, 'query')
        .yields('Query Error', null);

      const result = await query.hasRecipes(title);
      assert.equal(query.docClient.query.callCount, 1);
      assert.equal(console.error.callCount, 1);
      assert.equal(result, 'Query Error');
    });
  });

  describe('getAllByCookbook', () => {
    it('should return recipes', async () => {
      const title = 'Everyday Italian';
      const params = RecipeQueries.getRecipesByCookbookParams(title);

      const items = {
        Items: [
          {
            Recipe: 'Name 1',
          },
        ],
      };

      sandbox.stub(query.docClient, 'query')
        .withArgs(params)
        .yields(null, items);

      const result = await query.getAllByCookbook(title);
      assert.equal(query.docClient.query.callCount, 1);
      assert.deepEqual(result, items.Items);
    });

    it('should return empty array if no recipes', async () => {
      const title = 'Everyday Italian';
      const params = RecipeQueries.getRecipesByCookbookParams(title);

      sandbox.stub(query.docClient, 'query')
        .withArgs(params)
        .yields(null, {});

      const result = await query.getAllByCookbook(title);
      assert.equal(query.docClient.query.callCount, 1);
      assert.deepEqual(result, []);
    });

    it('should return empty array if error', async () => {
      const title = 'Everyday Italian';
      const params = RecipeQueries.getRecipesByCookbookParams(title);

      sandbox.stub(console, 'error');
      sandbox.stub(query.docClient, 'query')
        .withArgs(params)
        .yields('Recipes Error', null);

      const result = await query.getAllByCookbook(title);
      assert.equal(console.error.callCount, 1);
      assert.equal(query.docClient.query.callCount, 1);
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

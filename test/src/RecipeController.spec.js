const chai = require('chai');
const sinon = require('sinon');
const RecipeController = require('../../src/RecipeController');
const RecipeQueries = require('../../src/db/RecipeQueries');
const ConfigQueries = require('../../src/db/ConfigQueries');
const UserQueries = require('../../src/db/UserQueries');

const assert = chai.assert;

describe('src/RecipeController', () => {
  const sandbox = sinon.sandbox.create();

  const recipe1 = {
    Cookbook: 'Cookbook A',
    Name: 'Recipe 1',
    Page: '123',
    Link: 'http://recipes.com/1',
    UserEmail: 'user@email.com',
    Image: 'recipe_1.jpg',
  };

  const recipe2 = {
    Cookbook: 'Cookbook A',
    Name: 'Recipe 2',
    Link: 'http://recipes.com/2',
    UserEmail: 'nouser@email.com',
  };

  const recipe3 = {
    Cookbook: 'Cookbook A',
    Name: 'Recipe 3',
  };

  const recipeBaseUrl = 'http://base-url.com/test/';
  const settingsMap = {
    RecipeBaseUrl: recipeBaseUrl
  };

  const userMap = {
    'user@email.com': {
      FirstName: 'User',
      LastName: 'Name',
    },
  };

  // Reset test environment
  afterEach(() => {
    sandbox.restore();
  });

  describe('formatRecipeJSON', () => {
    it('should return null if no recipe', () => {
      const result = RecipeController.formatRecipeJSON();
      assert.isNull(result);
    });

    it('should return JSON', () => {
      const expected = {
        cookbook: recipe1.Cookbook,
        name: recipe1.Name,
        page: recipe1.Page,
        link: recipe1.Link,
        cook: userMap[recipe1.UserEmail].FirstName,
        image: `${settingsMap.RecipeBaseUrl}${recipe1.Image}`,
      };

      const result = RecipeController.formatRecipeJSON(recipe1, recipeBaseUrl, userMap);
      assert.deepEqual(result, expected);
    });

    it('should return JSON with user', () => {
      const expectedCook = userMap[recipe1.UserEmail].FirstName;

      const result = RecipeController.formatRecipeJSON(recipe1, recipeBaseUrl, userMap);
      assert.equal(result.cook, expectedCook);
    });

    it('should return JSON with no user', () => {
      const result = RecipeController.formatRecipeJSON(recipe3, recipeBaseUrl, userMap);
      assert.isUndefined(result.cook);
    });

    it('should return JSON with invalid user', () => {
      const result = RecipeController.formatRecipeJSON(recipe2, recipeBaseUrl, userMap);
      assert.isUndefined(result.cook);
    });

    it('should return JSON if userMap is missing', () => {
      const result = RecipeController.formatRecipeJSON(recipe1);
      assert.isUndefined(result.cook);
    });
  });

  describe('getByCookbook', async() => {
    it('should return error message if no event', async () => {
      const error = await RecipeController.getByCookbook();
      assert.equal(error, 'Select a Cookbook');
    });

    it('should return error message if no event params', async () => {
      const event = {};

      const error = await RecipeController.getByCookbook(event);
      assert.equal(error, 'Select a Cookbook');
    });

    it('should return error message if no event params path', async () => {
      const event = {
        params: {},
      };

      const error = await RecipeController.getByCookbook(event);
      assert.equal(error, 'Select a Cookbook');
    });

    it('should return empty array if getByCookbook is empty', async () => {
      const title = 'How Easy is That?';
      const event = {
        params: {
          path: {
            title,
          },
        },
      };

      sandbox.stub(RecipeQueries, 'getAllByCookbook')
        .withArgs(decodeURI(title))
        .returns([]);

      const result = await RecipeController.getByCookbook(event);
      assert.equal(RecipeQueries.getAllByCookbook.callCount, 1);
      assert.isArray(result);
      assert.isEmpty(result);
    });

    it('should return empty array if getByCookbook is null', async () => {
      const title = 'How Easy is That?';
      const event = {
        params: {
          path: {
            title,
          },
        },
      };

      sandbox.stub(RecipeQueries, 'getAllByCookbook')
        .withArgs(decodeURI(title))
        .returns(null);

      const result = await RecipeController.getByCookbook(event);
      assert.equal(RecipeQueries.getAllByCookbook.callCount, 1);
      assert.isArray(result);
      assert.isEmpty(result);
    });

    it('should return list of recipes', async () => {
      const title = 'How Easy is That?';
      const event = {
        params: {
          path: {
            title,
          },
        },
      };

      const recipes = [recipe1, recipe2, recipe3];

      sandbox.stub(RecipeQueries, 'getAllByCookbook')
        .withArgs(decodeURI(title))
        .returns(recipes);

      sandbox.stub(ConfigQueries, 'getSettings')
        .returns(settingsMap);

      sandbox.stub(UserQueries, 'getEmailMap')
        .returns(userMap);

      const result = await RecipeController.getByCookbook(event);
      assert.isArray(result);
      assert.deepEqual(result[0], RecipeController.formatRecipeJSON(recipe1,
        recipeBaseUrl, userMap));
      assert.deepEqual(result[1], RecipeController.formatRecipeJSON(recipe2,
        recipeBaseUrl, userMap));
      assert.deepEqual(result[2], RecipeController.formatRecipeJSON(recipe3,
        recipeBaseUrl, userMap));
    });
  });

  describe('getAll', async() => {
    const event = {
      params: {
        path: {
        },
      },
    };

    it('should return empty array if getAll is empty', async () => {
      sandbox.stub(RecipeQueries, 'getAll')
        .returns([]);

      const result = await RecipeController.getAll(event);
      assert.equal(RecipeQueries.getAll.callCount, 1);
      assert.isArray(result);
      assert.isEmpty(result);
    });

    it('should return empty array if getAll is null', async () => {
      sandbox.stub(RecipeQueries, 'getAll')
        .returns(null);

      const result = await RecipeController.getAll(event);
      assert.equal(RecipeQueries.getAll.callCount, 1);
      assert.isArray(result);
      assert.isEmpty(result);
    });

    it('should return list of recipes sorted by Name', async () => {
      const recipes = [recipe2, recipe1, recipe3];

      sandbox.stub(RecipeQueries, 'getAll')
        .returns(recipes);

      sandbox.stub(ConfigQueries, 'getSettings')
        .returns(settingsMap);

      sandbox.stub(UserQueries, 'getEmailMap')
        .returns(userMap);

      const result = await RecipeController.getAll(event);
      assert.isArray(result);
      assert.deepEqual(result[0], RecipeController.formatRecipeJSON(recipe1,
        recipeBaseUrl, userMap));
      assert.deepEqual(result[1], RecipeController.formatRecipeJSON(recipe2,
        recipeBaseUrl, userMap));
      assert.deepEqual(result[2], RecipeController.formatRecipeJSON(recipe3,
        recipeBaseUrl, userMap));
    });
  });
});

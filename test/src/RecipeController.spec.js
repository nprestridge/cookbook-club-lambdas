import chai from 'chai';
import sinon from 'sinon';
import Config from '../../src/Config';
import RecipeController from '../../src/RecipeController';

const assert = chai.assert;

const config = Config.load();
const controller = new RecipeController(config);

describe('src/RecipeController', () => {
  const sandbox = sinon.sandbox.create();

  const recipe1 = {
    Cookbook: 'Cookbook A',
    Name: 'Recipe 1',
    Page: '123',
    Link: 'http://recipes.com/1',
    UserEmail: 'user@email.com',
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
      };

      const result = RecipeController.formatRecipeJSON(recipe1, userMap);
      assert.deepEqual(result, expected);
    });

    it('should return JSON with user', () => {
      const expectedCook = userMap[recipe1.UserEmail].FirstName;

      const result = RecipeController.formatRecipeJSON(recipe1, userMap);
      assert.equal(result.cook, expectedCook);
    });

    it('should return JSON with no user', () => {
      const result = RecipeController.formatRecipeJSON(recipe3, userMap);
      assert.isUndefined(result.cook);
    });

    it('should return JSON with invalid user', () => {
      const result = RecipeController.formatRecipeJSON(recipe2, userMap);
      assert.isUndefined(result.cook);
    });

    it('should return JSON if userMap is missing', () => {
      const result = RecipeController.formatRecipeJSON(recipe1);
      assert.isUndefined(result.cook);
    });
  });

  describe('getByCookbook', async() => {
    it('should return error message if no event', async () => {
      const error = await controller.getByCookbook();
      assert.equal(error, 'Select a Cookbook');
    });

    it('should return error message if no event params', async () => {
      const event = {};

      const error = await controller.getByCookbook(event);
      assert.equal(error, 'Select a Cookbook');
    });

    it('should return error message if no event params path', async () => {
      const event = {
        params: {},
      };

      const error = await controller.getByCookbook(event);
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

      sandbox.stub(controller.recipes, 'getAllByCookbook')
        .withArgs(decodeURI(title))
        .returns([]);

      const result = await controller.getByCookbook(event);
      assert.equal(controller.recipes.getAllByCookbook.callCount, 1);
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

      sandbox.stub(controller.recipes, 'getAllByCookbook')
        .withArgs(decodeURI(title))
        .returns(null);

      const result = await controller.getByCookbook(event);
      assert.equal(controller.recipes.getAllByCookbook.callCount, 1);
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

      sandbox.stub(controller.recipes, 'getAllByCookbook')
        .withArgs(decodeURI(title))
        .returns(recipes);

      sandbox.stub(controller.users, 'getEmailMap')
        .returns(userMap);

      const result = await controller.getByCookbook(event);
      assert.isArray(result);
      assert.deepEqual(result[0], RecipeController.formatRecipeJSON(recipe1, userMap));
      assert.deepEqual(result[1], RecipeController.formatRecipeJSON(recipe2, userMap));
      assert.deepEqual(result[2], RecipeController.formatRecipeJSON(recipe3, userMap));
    });
  });
});

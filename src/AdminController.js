const CookbookCommands = require('./db/CookbookCommands');
const RecipeCommands = require('./db/RecipeCommands');

module.exports = {

  async upsertCookbook(event) {
    try {
      const cookbookData = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

      if (!cookbookData || !cookbookData.Slug || !cookbookData.Title
            || !cookbookData.Author || !cookbookData.MeetingDate) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Missing required fields: Slug, Title, Author, MeetingDate' }),
        };
      }

      const result = await CookbookCommands.upsertCookbook(cookbookData);

      return {
        statusCode: 201,
        body: JSON.stringify(result),
      };
    } catch (err) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: err.message }),
      };
    }
  },

  async upsertRecipe(event) {
    try {
      const recipeData = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

      if (!recipeData || !recipeData.Cookbook || !recipeData.Name || !recipeData.UserEmail) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Missing required fields: Cookbook, Name, UserEmail' }),
        };
      }

      const result = await RecipeCommands.upsertRecipe(recipeData);

      return {
        statusCode: 201,
        body: JSON.stringify(result),
      };
    } catch (err) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: err.message }),
      };
    }
  },

};

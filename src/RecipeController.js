const RecipeQueries = require('./db/RecipeQueries');
const UserQueries = require('./db/UserQueries');

module.exports = {
  /**
   * Returns API JSON for DynamoDB recipe item
   * @param  {object} item    DynamoDB object
   * @param  {object} users   Users map
   * @return {object}         JSON to return
   */
  formatRecipeJSON(item, users) {
    if (!item) {
      return null;
    }

    const formattedResult = {
      cookbook: item.Cookbook,
      name: item.Name,
      page: item.Page,
      link: item.Link,
    };

    // Add user info
    const userEmail = item.UserEmail;
    if (userEmail && users && users[userEmail]) {
      formattedResult.cook = users[userEmail].FirstName;
    }

    return formattedResult;
  },

  /**
  * Get all recipes by cookbook name in DynamoDB
  *
  * @param {object} event - params
  *   - title:  cookbook title
  */
  async getByCookbook(event) {
    const response = [];
    let cookbook;

    if (event && event.params && event.params.path) {
      cookbook = decodeURIComponent(event.params.path.title);
    }

    if (!cookbook) {
      const validationError = 'Select a Cookbook';
      return validationError;
    }

    // TODO:  Get cookbook details

    // retrieve recipes
    const items = await RecipeQueries.getAllByCookbook(cookbook);

    if (items && items.length > 0) {
      const users = await UserQueries.getEmailMap();

      // format JSON
      items.forEach((element) => {
        const json = this.formatRecipeJSON(element, users);
        response.push(json);
      });
    }

    return response;
  },
};

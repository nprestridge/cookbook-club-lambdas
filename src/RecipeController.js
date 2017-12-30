import RecipeQueries from './db/RecipeQueries';
import UserQueries from './db/UserQueries';

export default class RecipeController {
  /**
   * @param {object} configuration values
   */
  constructor(config) {
    this.recipes = new RecipeQueries(config);
    this.users = new UserQueries(config);
  }

  /**
   * Returns API JSON for DynamoDB recipe item
   * @param  {object} item    DynamoDB object
   * @param  {object} users   Users map
   * @return {object}         JSON to return
   */
  static formatRecipeJSON(item, users) {
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
  }

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
    const items = await this.recipes.getAllByCookbook(cookbook);

    if (items && items.length > 0) {
      const users = await this.users.getEmailMap();

      // format JSON
      items.forEach((element) => {
        const json = RecipeController.formatRecipeJSON(element, users);
        response.push(json);
      });
    }

    return response;
  }
}

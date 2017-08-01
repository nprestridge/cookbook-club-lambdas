import DBQuery from './DBQuery';

export default class Controller {
  /**
   * @param {object} configuration values
   */
  constructor(config) {
    this.db = new DBQuery(config);
  }

  /**
  * Get all recipes by cookbook name in DynamoDB
  *
  * @param {object} event - params
  *   - author:  cookbook author
  *   - title:  cookbook title
  */
  async getByCookbook(event) {
    const response = [];

    const author = decodeURIComponent(event.params.path.author);
    const cookbook = decodeURIComponent(event.params.path.title);

    // Check required fields are entered
    let validationError = '';

    if (!author) {
      validationError += 'Select an Author \n';
    }

    if (!cookbook) {
      validationError += 'Select a Cookbook \n';
    }

    if (validationError) {
      return validationError;
    }

    // TODO:  Get cookbook details

    // retrieve recipes
    const items = await this.db.getRecipes(cookbook);

    if (items.length > 0) {
      const users = await this.db.getUserMap();

      // format JSON
      items.forEach((element) => {
        const formattedResult = {
          cookbook: element.Cookbook,
          name: element.Name,
          page: element.Page,
          link: element.Link,
        };

        // Add user info
        const userEmail = element.UserEmail;
        if (users[userEmail]) {
          formattedResult.cook = users[userEmail].FirstName;
        }

        response.push(formattedResult);
      });
    }

    return response;
  }
}

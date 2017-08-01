import DBQuery from './DBQuery';

export default class Controller {
  /**
   * @param {object} configuration values
   */
  constructor(config) {
    this.db = new DBQuery(config);
  }

  /**
   * Create/update a cookbook
   *
   * @param {object} event - params
   *   - author:  cookbook author
   *   - title:  cookbook title
   */
  async createCookbook(event) {
    if (event && event.params && event.params.path) {
      const title = decodeURI(event.params.path.title);
      const author = decodeURI(event.params.path.author);
      const meetingDate = event.params.path.meetingDate;
      const blog = event.params.path.blog;

      // Check required fields are entered
      let validationError = '';
      if (!title) {
        validationError += 'Enter a title \n';
      }

      if (!author) {
        validationError += 'Enter an author \n';
      }

      // TODO - Validate date

      if (validationError) {
        return validationError;
      }

      // Insert item
      const item = {
        Title: title,
        Author: author,
      };

      if (meetingDate) {
        item.MeetingDate = meetingDate;
      }

      if (blog) {
        item.Blog = blog;
      }

      return this.db.updateCookbook(item);
    }

    return 'No details entered!';
  }

  /**
   * Delete a cookbook
   *
   * @param {object} event - params
   *   - author:  cookbook author
   *   - title:  cookbook title
   */
  async deleteCookbook(event) {
    if (event && event.params && event.params.path) {
      const title = decodeURI(event.params.path.title);
      const author = decodeURI(event.params.path.author);

      // Check required fields are entered
      let validationError = '';
      if (!title) {
        validationError += 'Enter a title \n';
      }

      if (!author) {
        validationError += 'Enter an author \n';
      }

      if (validationError) {
        return validationError;
      }

      // Do not delete if recipes are present
      const hasRecipes = await this.db.hasRecipes(title);
      if (!hasRecipes) {
        return this.db.deleteCookbook(title, author);
      }

      return 'Cookbook has recipes which cannot be deleted.';
    }

    return 'Error deleting cookbook!';
  }

  /**
   * Get list of cookbooks
   * @param {object} event - params
   */
  async getCookbooks(event) {
    const response = [];

    // retrieve cookbooks
    const items = await this.db.getCookbooks();

    let sortBy = 'date';
    let sortOrder = 'desc';

    if (event && event.params && event.params.path) {
      const field = decodeURI(event.params.path.sortBy);
      const order = decodeURI(event.params.path.sortOrder);

      sortBy = field || sortBy;
      sortOrder = order || sortOrder;
    }

    // format JSON
    items.forEach((element) => {
      const formattedResult = {
        title: element.Title,
        author: element.Author,
      };

      if (element.Blog) {
        formattedResult.blog = element.Blog;
      }

      if (element.MeetingDate) {
        const meetingDate = element.MeetingDate;
        formattedResult.isoDate = meetingDate;
        formattedResult.displayDate = new Date(meetingDate).toLocaleDateString();
      }

      response.push(formattedResult);
    });

    // apply sorting
    if (sortBy === 'title' || sortBy === 'author') {
      response.sort((a, b) => {
        if (sortOrder === 'asc') {
          return a[sortBy].localeCompare(b[sortBy]);
        }

        return b[sortBy].localeCompare(a[sortBy]);
      });
    } else {
      // sort books by meeting date desc, cookbooks with no date will appear at end
      response.sort((a, b) => {
        if (!a.isoDate && b.isoDate) {
          return 1;
        } else if (!a.isoDate && !b.isoDate) {
          // If no date on both, sort by title asc
          return a.title - b.title;
        } else if (sortOrder === 'asc') {
          return new Date(a.isoDate) - new Date(b.isoDate);
        }

        return new Date(b.isoDate) - new Date(a.isoDate);
      });
    }

    return response;
  }

  /**
  * Get all recipes by cookbook name in DynamoDB
  *
  * @param {object} event - params
  *   - author:  cookbook author
  *   - title:  cookbook title
  */
  async getCookbookRecipes(event) {
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

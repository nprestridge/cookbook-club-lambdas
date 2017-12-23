import moment from 'moment';
import CookbookQueries from './db/CookbookQueries';
import RecipeQueries from './db/RecipeQueries';

export default class CookbookController {
  /**
   * @param {object} configuration values
   */
  constructor(config) {
    this.cookbooks = new CookbookQueries(config);
    this.recipes = new RecipeQueries(config);
  }

  /**
   * Check if cookbook fields are valid
   * @param  {string} title
   * @param  {string} author
   * @param  {string} date
   * @return {string}        Returns error message if validation fails
   */
  static validateCookbook(title, author, date) {
    let validationError = '';
    if (!title) {
      validationError += 'Enter a title \n';
    }

    if (!author) {
      validationError += 'Enter an author \n';
    }

    if (date && !(moment(date, 'YYYY-MM-DD', true).isValid())) {
      validationError += `Date ${date} is not in YYYY-MM-DD format \n`;
    }

    return validationError;
  }

  /**
   * Create/update a cookbook
   *
   * @param {object} event - params
   *   - author:  cookbook author
   *   - title:  cookbook title
   */
  async create(event) {
    if (event && event.params && event.params.path) {
      const title = decodeURI(event.params.path.title);
      const author = decodeURI(event.params.path.author);
      const meetingDate = event.params.path.meetingDate;
      const blog = event.params.path.blog;

      // Check required fields are entered
      const validationError = CookbookController.validateCookbook(title, author, meetingDate);

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

      return this.cookbooks.update(item);
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
  async delete(event) {
    if (event && event.params && event.params.path) {
      const title = decodeURI(event.params.path.title);
      const author = decodeURI(event.params.path.author);

      // Check required fields are entered
      const validationError = CookbookController.validateCookbook(title, author);

      if (validationError) {
        return validationError;
      }

      // Do not delete if recipes are present
      const hasRecipes = await this.recipes.hasRecipes(title);
      if (!hasRecipes) {
        return this.cookbooks.delete(title, author);
      }

      return 'Cookbook has recipes which cannot be deleted.';
    }

    return 'Error deleting cookbook!';
  }

  /**
   * Get list of cookbooks
   * @param {object} event - params
   */
  async getAll(event) {
    const response = [];

    // retrieve cookbooks
    const items = await this.cookbooks.getAll();

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

      if (element.Thumbnail) {
        formattedResult.thumbnail = element.Thumbnail;
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
}

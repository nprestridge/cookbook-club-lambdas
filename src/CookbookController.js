const moment = require('moment');
const CookbookQueries = require('./db/CookbookQueries');
const RecipeQueries = require('./db/RecipeQueries');

module.exports = {
  /**
   * Check if cookbook fields are valid
   * @param  {string} title
   * @param  {string} author
   * @param  {string} date
   * @return {string}        Returns error message if validation fails
   */
  validateCookbook(title, author, date) {
    const validationError = [];

    if (!title) {
      validationError.push('Enter a title');
    }

    if (!author) {
      validationError.push('Enter an author');
    }

    if (date && !(moment(date, 'YYYY-MM-DD', true).isValid())) {
      validationError.push(`Date ${date} is not in YYYY-MM-DD format`);
    }

    return (validationError.length > 0) ? validationError : null;
  },

  /**
   * Returns API JSON for DynamoDB cookbook item
   * @param  {object} item  DynamoDB object
   * @return {object}       JSON to return
   */
  formatCookbookJSON(item) {
    if (!item) {
      return null;
    }

    const formattedResult = {
      title: item.Title,
      author: item.Author,
    };

    if (item.Blog) {
      formattedResult.blog = item.Blog;
    }

    if (item.MeetingDate) {
      const meetingDate = item.MeetingDate;
      formattedResult.isoDate = meetingDate;
      formattedResult.displayDate = moment(meetingDate).format('M/D/YYYY');
    }

    if (item.Thumbnail) {
      formattedResult.thumbnail = item.Thumbnail;
    }

    if (item.AmazonLink) {
      formattedResult.amazon = item.AmazonLink;
    }

    return formattedResult;
  },

  /**
   * Create/update a cookbook
   *
   * @param {object} event - params
   *   - author:  cookbook author
   *   - title:  cookbook title
   */
  async create(event) {
    if (event && event.params && event.params.path) {
      const title = event.params.path.title;
      const author = event.params.path.author;
      const meetingDate = event.params.path.meetingDate;
      const blog = event.params.path.blog;

      // Check required fields are entered
      const validationError = this.validateCookbook(title, author, meetingDate);

      if (validationError) {
        return validationError;
      }

      // Insert item
      const item = {
        Title: decodeURI(title),
        Author: decodeURI(author),
      };

      if (meetingDate) {
        item.MeetingDate = meetingDate;
      }

      if (blog) {
        item.Blog = blog;
      }

      return CookbookQueries.update(item);
    }

    return 'No details entered!';
  },

  /**
   * Delete a cookbook
   *
   * @param {object} event - params
   *   - author:  cookbook author
   *   - title:  cookbook title
   */
  async delete(event) {
    if (event && event.params && event.params.path) {
      let title = event.params.path.title;
      let author = event.params.path.author;

      // Check required fields are entered
      const validationError = this.validateCookbook(title, author);

      if (validationError) {
        return validationError;
      }

      // Do not delete if recipes are present
      title = decodeURI(title);
      author = decodeURI(author);

      const hasRecipes = await RecipeQueries.hasRecipes(title);
      if (!hasRecipes) {
        return CookbookQueries.delete(title, author);
      }

      return 'Cookbook has recipes which cannot be deleted.';
    }

    return 'Error deleting cookbook!';
  },

  /**
   * Get list of cookbooks
   * @param {object} event - params
   */
  async getAll(event) {
    const response = [];

    // retrieve cookbooks
    const items = await CookbookQueries.getAll();

    if (!items) {
      return response;
    }

    // format cookbooks
    items.forEach((element) => {
      response.push(this.formatCookbookJSON(element));
    });

    // determine sort type
    let sortBy = 'date';
    let sortOrder = 'desc';

    if (event && event.params && event.params.path) {
      const field = event.params.path.sortBy;
      const order = event.params.path.sortOrder;

      sortBy = field || sortBy;
      sortOrder = order || sortOrder;
    }

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
        } else if (a.isoDate && !b.isoDate) {
          return -1;
        } else if (!a.isoDate && !b.isoDate) {
          // If no date on both, sort by title asc
          return (a.title).localeCompare(b.title);
        } else if (sortOrder === 'asc') {
          return new Date(a.isoDate) - new Date(b.isoDate);
        }

        return new Date(b.isoDate) - new Date(a.isoDate);
      });
    }

    return response;
  },
};

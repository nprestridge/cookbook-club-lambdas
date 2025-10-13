const moment = require('moment');
const CookbookQueries = require('./db/CookbookQueries');

module.exports = {
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
      title: item.Title.S,
      author: item.Author.S,
      slug: item.Slug.S,
    };

    if (item.Blog) {
      formattedResult.blog = item.Blog.S;
    }

    if (item.MeetingDate) {
      const meetingDate = item.MeetingDate.S;
      formattedResult.isoDate = meetingDate;
      formattedResult.displayDate = moment(meetingDate).format('M/D/YYYY');
    }

    if (item.Thumbnail) {
      formattedResult.thumbnail = item.Thumbnail.S;
    }

    if (item.AmazonLink) {
      formattedResult.amazon = item.AmazonLink.S;
    }

    return formattedResult;
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
        }

        if (a.isoDate && !b.isoDate) {
          return -1;
        }

        if (!a.isoDate && !b.isoDate) {
          // If no date on both, sort by title asc
          return (a.title).localeCompare(b.title);
        }

        if (sortOrder === 'asc') {
          return new Date(a.isoDate) - new Date(b.isoDate);
        }

        return new Date(b.isoDate) - new Date(a.isoDate);
      });
    }

    return response;
  },
};

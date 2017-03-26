import AWS from 'aws-sdk'

export default class Controller {

  /**
   * @param {object} configuration values
   */
  constructor(config) {
    this.config = config;
    this.docClient = new AWS.DynamoDB.DocumentClient(config.dynamodb);
  }

  /**
   * Get list of cookbooks
   * @param {object} event - params
   */
  async process(event) {
    let response = [];

    // retrieve cookbooks
    const items = await this._getCookbooks();

    let sortBy = 'date';
    let sortOrder = 'desc';

    if (event && event.params && event.params.path) {
      const field = decodeURI(event.params.path.sortBy);
      const order = decodeURI(event.params.path.sortOrder);

      sortBy = field ? field : sortBy;
      sortOrder = order ? order : sortOrder;
    }

    // format JSON
    items.forEach(function (element) {
      const formattedResult = {
        title: element.Title,
        author: element.Author
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
      response.sort(function (a, b) {
        if (sortOrder === 'asc') {
          return a[sortBy].localeCompare(b[sortBy]);
        }
        else {
          return b[sortBy].localeCompare(a[sortBy]);
        }
      });
    }
    else {
      // sort books by meeting date desc, cookbooks with no date will appear at end
      response.sort(function (a, b) {
        if (!a.isoDate && b.isoDate) {
          return 1;
        }
        else if (!a.isoDate && !b.isoDate) {
          // If no date on both, sort by title asc
          return a.title - b.title;
        }
        else if (sortOrder === 'asc') {
          return new Date(a.isoDate) - new Date(b.isoDate);
        }
        else {
          return new Date(b.isoDate) - new Date(a.isoDate);
        }
      });
    }

    return response;
  }

  _getCookbooks() {
    return new Promise((resolve, reject) => {
      const params = {
        TableName: 'Cookbook'
      };

      this.docClient.scan(params, function (err, data) {
        if (err) {
          console.error(err);
          return resolve([]);
        }
        return resolve(data.Items || []);
      });
    });
  }
}

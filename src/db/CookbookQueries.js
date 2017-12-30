/* eslint no-console: ["error", { allow: ["warn", "error"] }] */

/**
 * Database queries - Cookbook
 */
import AWS from 'aws-sdk';

export default class CookbookQueries {
  /**
   * @param {object} configuration values
   */
  constructor(config) {
    this.docClient = new AWS.DynamoDB.DocumentClient(config.dynamodb);
  }

  /**
   * Update Cookbook
   * @param  {Object} item Title, Author, MeetingDate (optional), Blog (optional)
   * @return {Promise}
   */
  update(item) {
    return new Promise((resolve) => {
      const params = {
        TableName: 'Cookbook',
        Item: item,
      };

      this.docClient.put(params, (err) => {
        if (err) {
          console.error(err);
          return resolve(err);
        }

        return resolve('Success');
      });
    });
  }

  /**
   * Delete cookbooks
   * @param  {string} title
   * @param  {string} author
   * @return {Promise}
   */
  delete(title, author) {
    return new Promise((resolve) => {
      const params = {
        TableName: 'Cookbook',
        Key: {
          Title: title,
          Author: author,
        },
      };

      this.docClient.delete(params, (err) => {
        if (err) {
          console.error(err);
          return resolve(err);
        }
        return resolve('Success');
      });
    });
  }

  /**
   * Returns all cookbooks
   * @return {Promise}
   */
  getAll() {
    return new Promise((resolve) => {
      const params = {
        TableName: 'Cookbook',
      };

      this.docClient.scan(params, (err, data) => {
        if (err) {
          console.error(err);
          return resolve([]);
        }

        return resolve(data.Items || []);
      });
    });
  }
}

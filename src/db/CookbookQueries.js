/* eslint no-console: ["error", { allow: ["warn", "error"] }] */

/**
 * Database queries - Cookbook
 */
const AWS = require('aws-sdk');
const { load } = require('../Config');

const dynamodb = load().dynamodb;

module.exports = {
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

      const db = new AWS.DynamoDB.DocumentClient(dynamodb);
      db.put(params, (err) => {
        if (err) {
          console.error(err);
          return resolve(err);
        }

        return resolve('Success');
      });
    });
  },

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

      const db = new AWS.DynamoDB.DocumentClient(dynamodb);
      db.delete(params, (err) => {
        if (err) {
          console.error(err);
          return resolve(err);
        }
        return resolve('Success');
      });
    });
  },

  /**
   * Returns all cookbooks
   * @return list of cookbooks
   */
  async getAll() {
    const params = {
      TableName: 'Cookbook',
    };

    const db = new AWS.DynamoDB.DocumentClient(dynamodb);

    try {
      const data = await db.scan(params).promise();
      return data.Items || [];
    } catch (err) {
      console.error(err);
    }

    return [];
  },
};

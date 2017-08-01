/* eslint no-console: ["error", { allow: ["warn", "error"] }] */

/**
 * Database queries
 */
import AWS from 'aws-sdk';

export default class DBQuery {
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
  updateCookbook(item) {
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
  deleteCookbook(title, author) {
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
   * Returns if cookbook has any associated recipes
   * @param  {string}  title
   * @return {Boolean}
   */
  hasRecipes(title) {
    return new Promise((resolve, reject) => {
      const params = {
        TableName: 'Recipe',
        KeyConditionExpression: 'Cookbook = :cookbook',
        ExpressionAttributeValues: {
          ':cookbook': title,
        },
      };

      this.docClient.query(params, (err, data) => {
        if (err) {
          console.error(err);
          return reject();
        }

        if (data && data.Items && data.Items.length > 0) {
          return resolve(true);
        }

        return resolve(false);
      });
    });
  }

  /**
   * Returns all cookbooks
   * @return {Promise}
   */
  getCookbooks() {
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

  /**
   * Returns all recipes by cookbook
   * @param  {string} cookbook
   * @return {Promise}
   */
  getRecipes(cookbook) {
    return new Promise((resolve) => {
      const params = {
        TableName: 'Recipe',
        KeyConditionExpression: 'Cookbook = :cookbook',
        ExpressionAttributeValues: {
          ':cookbook': cookbook,
        },
      };

      this.docClient.query(params, (err, data) => {
        if (err) {
          console.error(err);
          return resolve([]);
        }
        return resolve(data.Items || []);
      });
    });
  }

  /**
   * Returns a user map of key (email) -> user data
   * @return {Promise}
   */
  getUserMap() {
    const params = {
      TableName: 'User',
    };

    return new Promise((resolve, reject) => {
      this.docClient.scan(params, (err, data) => {
        if (err) {
          return reject(err);
        }

        const map = {};
        const items = (data && data.Items) ? data.Items : [];
        items.forEach((element) => {
          map[element.Email] = element;
        });

        return resolve(map);
      });
    });
  }
}

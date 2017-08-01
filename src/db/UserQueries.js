/* eslint no-console: ["error", { allow: ["warn", "error"] }] */

/**
 * Database queries - User
 */
import AWS from 'aws-sdk';

export default class UserQueries {
  /**
   * @param {object} configuration values
   */
  constructor(config) {
    this.docClient = new AWS.DynamoDB.DocumentClient(config.dynamodb);
  }

  /**
   * Returns a user map of key (email) -> user data
   * @return {Promise}
   */
  getEmailMap() {
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

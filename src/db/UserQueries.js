/* eslint no-console: ["error", { allow: ["warn", "error"] }] */

/**
 * Database queries - User
 */
const AWS = require('aws-sdk');
const { load } = require('../Config');

const dynamodb = load().dynamodb;

module.exports = {
  /**
   * Returns a user map of key (email) -> user data
   * @return {Promise}
   */
  getEmailMap() {
    const params = {
      TableName: 'User',
    };

    return new Promise((resolve) => {
      const db = new AWS.DynamoDB.DocumentClient(dynamodb);
      db.scan(params, (err, data) => {
        if (err) {
          console.error(err);
          return resolve(err);
        }

        const map = {};
        const items = (data && data.Items) ? data.Items : [];
        items.forEach((element) => {
          map[element.Email] = element;
        });

        return resolve(map);
      });
    });
  },
};

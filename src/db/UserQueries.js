/* eslint no-console: ["error", { allow: ["warn", "error"] }] */

/**
 * Database queries - User
 */
const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { load } = require('../Config');

const { dynamodb } = load();

module.exports = {
  /**
   * Returns a user map of key (email) -> user data
   * @return {Promise}
   */
  async getEmailMap() {
    const map = {};

    try {
      const client = new DynamoDBClient({
        region: dynamodb.region,
      });

      const command = new ScanCommand({
        TableName: 'User',
      });

      const data = await client.send(command);

      const items = (data && data.Items) ? data.Items : [];
      items.forEach((element) => {
        map[element.Email.S] = element;
      });
    } catch (err) {
      console.error(err);
    }

    return map;
  },
};

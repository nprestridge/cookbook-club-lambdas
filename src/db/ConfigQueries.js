/* eslint no-console: ["error", { allow: ["warn", "error"] }] */

/**
 * Database queries - Config
 */
const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { load } = require('../Config');

const { dynamodb } = load();

module.exports = {
  /**
   * Returns a user map of key (email) -> user data
   * @return {Promise}
   */
  async getSettings() {
    const map = {};

    try {
      const client = new DynamoDBClient({
        region: dynamodb.region,
      });

      const command = new ScanCommand({
        TableName: 'Config',
      });

      const data = await client.send(command);
      const items = (data && data.Items) ? data.Items : [];
      items.forEach((element) => {
        map[element.Key.S] = element.Value.S;
      });
    } catch (err) {
      console.error(err);
    }

    return map;
  },
};

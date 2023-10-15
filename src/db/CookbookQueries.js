/* eslint no-console: ["error", { allow: ["warn", "error"] }] */

/**
 * Database queries - Cookbook
 */
const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { load } = require('../Config');

const { dynamodb } = load();

module.exports = {
  /**
   * Returns all cookbooks
   * @return list of cookbooks
   */
  async getAll() {
    try {
      const client = new DynamoDBClient({
        region: dynamodb.region,
      });

      const command = new ScanCommand({
        TableName: 'Cookbook',
      });

      const results = await client.send(command);

      return results.Items || [];
    } catch (err) {
      console.error(err);
    }

    return [];
  },
};

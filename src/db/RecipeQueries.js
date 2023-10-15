/* eslint no-console: ["error", { allow: ["warn", "error"] }] */

/**
 * Database queries - Recipe
 */
const { DynamoDBClient, QueryCommand, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { load } = require('../Config');

const { dynamodb } = load();

module.exports = {
  /**
   * Returns all recipes by cookbook
   * @param  {string} cookbook
   * @return {Promise}
   */
  async getAllByCookbook(cookbook) {
    try {
      const client = new DynamoDBClient({
        region: dynamodb.region,
      });

      const command = new QueryCommand(
        {
          TableName: 'Recipe',
          KeyConditionExpression: 'Cookbook = :cookbook',
          ExpressionAttributeValues: {
            ':cookbook': {
              S: cookbook,
            },
          },
        },
      );

      const results = await client.send(command);
      return results.Items || [];
    } catch (err) {
      console.error(err);
    }

    return [];
  },

  /**
   * Returns all recipes
   * @return {Promise}
   */
  async getAll() {
    try {
      const client = new DynamoDBClient({
        region: dynamodb.region,
      });

      const command = new ScanCommand({
        TableName: 'Recipe',
      });

      const results = await client.send(command);
      return results.Items || [];
    } catch (err) {
      console.error(err);
    }

    return [];
  },

};

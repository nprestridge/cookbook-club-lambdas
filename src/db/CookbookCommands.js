/* eslint no-console: ["error", { allow: ["warn", "error"] }] */

/**
 * Database commands - Recipe
 */
const {
  DynamoDBClient, PutItemCommand,
} = require('@aws-sdk/client-dynamodb');
const { load } = require('../Config');

const { dynamodb } = load();

module.exports = {

  /**
   * Upserts a cookbook to DynamoDB
   * @param {object} cookbook - Cookbook data
   * @return {Promise<object>} - Inserted cookbook
   */
  async upsertCookbook(cookbook) {
    try {
      const client = new DynamoDBClient({
        region: dynamodb.region,
      });

      const allowedFields = ['Author', 'Title', 'Blog', 'AmazonLink',
        'MeetingDate', 'Slug', 'Thumbnail'];
      const item = {};
      allowedFields.forEach((field) => {
        if (cookbook[field] !== undefined) {
          item[field] = { S: String(cookbook[field]) };
        }
      });

      const command = new PutItemCommand({
        TableName: 'Cookbook',
        Item: item,
      });

      await client.send(command);
      return cookbook;
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
};

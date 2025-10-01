/* eslint no-console: ["error", { allow: ["warn", "error"] }] */

/**
 * Database commands - Recipe
 */
const {
  DynamoDBClient, PutItemCommand, ScanCommand, DeleteItemCommand,
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

  /**
   * Deletes a cookbook from DynamoDB by Title and Author if no associated recipes exist
   * @param {string} title - Cookbook title
   * @param {string} author - Cookbook author
   * @return {Promise<object>} - Delete response or error
   */
  async deleteCookbook(title, author) {
    try {
      const client = new DynamoDBClient({ region: dynamodb.region });

      // Check for associated recipes
      const recipeScan = new ScanCommand({
        TableName: 'Recipe',
        FilterExpression: 'Cookbook = :cookbook',
        ExpressionAttributeValues: {
          ':cookbook': { S: title },
        },
      });

      const recipes = await client.send(recipeScan);
      if (recipes.Items && recipes.Items.length > 0) {
        throw new Error(`Cannot delete cookbook '${title}': recipes exist for this cookbook.`);
      }

      // Delete the cookbook
      const deleteCmd = new DeleteItemCommand({
        TableName: 'Cookbook',
        Key: {
          Title: { S: String(title) },
          Author: { S: String(author) },
        },
      });

      const result = await client.send(deleteCmd);
      return result;
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
};

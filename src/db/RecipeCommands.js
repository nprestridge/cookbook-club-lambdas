/* eslint no-console: ["error", { allow: ["warn", "error"] }] */

/**
 * Database commands - Recipe
 */
const {
  DynamoDBClient, PutItemCommand, DeleteItemCommand,
} = require('@aws-sdk/client-dynamodb');
const { load } = require('../Config');

const { dynamodb } = load();

module.exports = {

  /**
   * Upserts a recipe to DynamoDB
   * @param {object} recipe - Recipe data
   * @return {Promise<object>} - Inserted recipe
   */
  async upsertRecipe(recipe) {
    try {
      const client = new DynamoDBClient({
        region: dynamodb.region,
      });

      const allowedFields = ['Cookbook', 'Name', 'Link', 'Page', 'UserEmail', 'Image'];
      const item = {};
      allowedFields.forEach((field) => {
        if (recipe[field] !== undefined) {
          // Page should be a Number type in DynamoDB if present
          if (field === 'Page') {
            item[field] = { N: String(recipe[field]) };
          } else {
            item[field] = { S: String(recipe[field]) };
          }
        }
      });

      const command = new PutItemCommand({
        TableName: 'Recipe',
        Item: item,
      });

      await client.send(command);
      return recipe;
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  /**
   * Deletes a recipe from DynamoDB by Cookbook and Name
   * @param {string} cookbook - Cookbook name
   * @param {string} name - Recipe name
   * @return {Promise<object>} - DynamoDB delete response
   */
  async deleteRecipe(cookbook, name) {
    try {
      const client = new DynamoDBClient({
        region: dynamodb.region,
      });

      const command = new DeleteItemCommand({
        TableName: 'Recipe',
        Key: {
          Cookbook: { S: String(cookbook) },
          Name: { S: String(name) },
        },
      });

      const result = await client.send(command);
      return result;
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

};

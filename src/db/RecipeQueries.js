/* eslint no-console: ["error", { allow: ["warn", "error"] }] */

/**
 * Database queries - Recipe
 */
import AWS from 'aws-sdk';

export default class RecipeQueries {
  /**
   * @param {object} configuration values
   */
  constructor(config) {
    this.docClient = new AWS.DynamoDB.DocumentClient(config.dynamodb);
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
   * Returns all recipes by cookbook
   * @param  {string} cookbook
   * @return {Promise}
   */
  getAllByCookbook(cookbook) {
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
}

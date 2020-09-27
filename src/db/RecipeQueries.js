/* eslint no-console: ["error", { allow: ["warn", "error"] }] */

/**
 * Database queries - Recipe
 */
const AWS = require('aws-sdk');
const { load } = require('../Config');

const dynamodb = load().dynamodb;

module.exports = {
  /**
   * Returns if cookbook has any associated recipes
   * @param  {string}  title
   * @return {Boolean}
   */
  hasRecipes(title) {
    return new Promise((resolve) => {
      const params = this.getRecipesByCookbookParams(title);

      const db = new AWS.DynamoDB.DocumentClient(dynamodb);
      db.query(params, (err, data) => {
        if (err) {
          console.error(err);
          return resolve(err);
        }

        if (data && data.Items && data.Items.length > 0) {
          return resolve(true);
        }

        return resolve(false);
      });
    });
  },

  /**
   * Returns all recipes by cookbook
   * @param  {string} cookbook
   * @return {Promise}
   */
  getAllByCookbook(cookbook) {
    return new Promise((resolve) => {
      const params = this.getRecipesByCookbookParams(cookbook);

      const db = new AWS.DynamoDB.DocumentClient(dynamodb);
      db.query(params, (err, data) => {
        if (err) {
          console.error(err);
          return resolve([]);
        }

        return resolve(data.Items || []);
      });
    });
  },

  /**
   * Returns params to get recipes by cookbook
   * @param  {string} cookbook
   * @return {object}
   */
  getRecipesByCookbookParams(cookbook) {
    const params = {
      TableName: 'Recipe',
      KeyConditionExpression: 'Cookbook = :cookbook',
      ExpressionAttributeValues: {
        ':cookbook': cookbook,
      },
    };

    return params;
  },

  /**
   * Returns all recipes
   * @return {Promise}
   */
  getAll() {
    return new Promise((resolve) => {
      const params = {
        TableName: 'Recipe',
      };

      const db = new AWS.DynamoDB.DocumentClient(dynamodb);
      db.scan(params, (err, data) => {
        if (err) {
          console.error(err);
          return resolve([]);
        }

        return resolve(data.Items || []);
      });
    });
  },
};

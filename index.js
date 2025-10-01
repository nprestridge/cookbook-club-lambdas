const CookbookController = require('./src/CookbookController');
const RecipeController = require('./src/RecipeController');
const AdminController = require('./src/AdminController');

/**
 * A map of lambda handlers to controller methods
 * @return {Function} handler function
 */
const handlers = {
  getCookbooks: function handler(event) {
    return CookbookController.getAll(event);
  },
  getCookbookRecipes: function handler(event) {
    return RecipeController.getByCookbook(event);
  },
  getRecipes: function handler(event) {
    return RecipeController.getAll(event);
  },
  upsertCookbook: function handler(event) {
    return AdminController.upsertCookbook(event);
  },
  upsertRecipe: function handler(event) {
    return AdminController.upsertRecipe(event);
  },
  deleteCookbook: function handler(event) {
    return AdminController.deleteCookbook(event);
  },
  deleteRecipe: function handler(event) {
    return AdminController.deleteRecipe(event);
  },
};

module.exports = {

  /**
   * Generic handler to execute controller methods
   * @param  {string}   handlerName   Method name
   * @param  {Object}   event         JSON event parameters
   * @param  {Object}   context       Lambda context object
   * @param  {Function} callback      Callback funcion
   * @return {Promise}
   */
  async execute(handlerName, event, context, callback) {
    try {
      const response = await handlers[handlerName](event);
      return callback(null, response);
    } catch (e) {
      console.error(`FATAL Caught: ${JSON.stringify(e)}`); // eslint-disable-line no-console
      return callback(e);
    }
  },

  async getCookbooks(event, context, callback) {
    await module.exports.execute('getCookbooks', event, context, callback);
  },

  async getCookbookRecipes(event, context, callback) {
    await module.exports.execute('getCookbookRecipes', event, context, callback);
  },

  async getRecipes(event, context, callback) {
    await module.exports.execute('getRecipes', event, context, callback);
  },

  async upsertCookbook(event, context, callback) {
    await module.exports.execute('upsertCookbook', event, context, callback);
  },

  async upsertRecipe(event, context, callback) {
    await module.exports.execute('upsertRecipe', event, context, callback);
  },

  async deleteCookbook(event, context, callback) {
    await module.exports.execute('deleteCookbook', event, context, callback);
  },

  async deleteRecipe(event, context, callback) {
    await module.exports.execute('deleteRecipe', event, context, callback);
  },

};

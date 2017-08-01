import Config from './src/Config';
import Controller from './src/Controller';

const config = Config.load();
const controller = new Controller(config);

/**
 * A map of lambda handlers to controller methods
 * @return {Function} handler function
 */
const handlers = {
  createCookbook: function handler(event) {
    return controller.createCookbook(event);
  },
  deleteCookbook: function handler(event) {
    return controller.deleteCookbook(event);
  },
  getCookbooks: function handler(event) {
    return controller.getCookbooks(event);
  },
  getCookbookRecipes: function handler(event) {
    return controller.getCookbookRecipes(event);
  },
};

/**
 * Generic handler to execute controller methods
 * @param  {string}   handlerName   Method name
 * @param  {Object}   event         JSON event parameters
 * @param  {Object}   context       Lambda context object
 * @param  {Function} callback      Callback funcion
 * @return {Promise}
 */
exports.execute = async (handlerName, event, context, callback) => {
  try {
    const response = await handlers[handlerName](event);
    return callback(null, response);
  } catch (e) {
    console.error(`FATAL Caught: ${JSON.stringify(e)}`); // eslint-disable-line no-console
    return callback(e);
  }
};

exports.createCookbook = async (event, context, callback) => {
  exports.execute('createCookbook', event, context, callback);
};

exports.deleteCookbook = async (event, context, callback) => {
  exports.execute('deleteCookbook', event, context, callback);
};

exports.getCookbooks = async (event, context, callback) => {
  exports.execute('getCookbooks', event, context, callback);
};

exports.getCookbookRecipes = async (event, context, callback) => {
  exports.execute('getCookbookRecipes', event, context, callback);
};

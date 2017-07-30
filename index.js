import Config from './src/Config';
import Controller from './src/Controller';

exports.createCookbook = async (event, context, callback) => {
  try {
    const config = Config.load();
    const controller = new Controller(config);
    const response = await controller.createCookbook(event);

    return callback(null, response);
  } catch (e) {
    console.error(`FATAL Caught: ${JSON.stringify(e)}`);
    return callback(e);
  }
};

exports.deleteCookbook = async (event, context, callback) => {
  try {
    const config = Config.load();
    const controller = new Controller(config);
    const response = await controller.deleteCookbook(event);

    return callback(null, response);
  } catch (e) {
    console.error(`FATAL Caught: ${JSON.stringify(e)}`);
    return callback(e);
  }
};

exports.getCookbooks = async (event, context, callback) => {
  try {
    const config = Config.load();
    const controller = new Controller(config);
    const response = await controller.getCookbooks(event);

    return callback(null, response);
  } catch (e) {
    console.error(`FATAL Caught: ${JSON.stringify(e)}`);
    return callback(e);
  }
};

exports.getCookbookRecipes = async (event, context, callback) => {
  try {
    const config = Config.load();
    const controller = new Controller(config);
    const response = await controller.getCookbookRecipes(event);

    return callback(null, response);
  } catch (e) {
    console.error(`FATAL Caught: ${JSON.stringify(e)}`);
    return callback(e);
  }
};

import Config from './src/Config';
import Controller from './src/Controller';

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

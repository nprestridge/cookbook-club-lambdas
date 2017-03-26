import Config from './src/Config';
import Controller from './src/Controller';

exports.handler = async (event, context, callback) => {
  try {
    const config = Config.load();
    const controller = new Controller(config);
    const response = await controller.process(event);

    return callback(null, response);
  } catch (e) {
    console.log(`FATAL Caught: ${JSON.stringify(e)}`);
    return callback(e);
  }
};

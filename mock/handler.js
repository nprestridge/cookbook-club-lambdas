/* eslint no-console: 0 */

module.exports = {
  /**
   * Display results of mock run
   * @param  {string} error   Error message
   * @param  {string} message Success message
   */
  displayResult: (error, message) => {
    if (error) {
      console.log('ERROR', error);
      return;
    }

    console.log(message);
  },
};

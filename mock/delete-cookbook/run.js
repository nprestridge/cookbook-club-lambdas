const event = require('./event.json');
const handler = require('../handler');
const index = require('./../../index');

index.deleteCookbook(event, {}, (e, m) => {
  handler.displayResult(e, m);
});

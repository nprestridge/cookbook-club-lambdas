const event = require('./event.json');
const handler = require('../handler');
const index = require('./../../index');

index.getCookbooks(event, {}, (e, m) => {
  handler.displayResult(e, m);
});

const event = require('./event.json');
const handler = require('../handler');
const index = require('../../index');

index.deleteRecipe(event, {}, (e, m) => {
  handler.displayResult(e, m);
});

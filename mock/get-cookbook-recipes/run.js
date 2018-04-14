const event = require('./event.json');
const handler = require('../handler');
const index = require('./../../index');

index.getCookbookRecipes(event, {}, (e, m) => {
  handler.displayResult(e, m);
});

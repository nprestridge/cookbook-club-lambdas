import event from './event.json';
import handler from '../handler';
import index from './../../index';

index.createCookbook(event, {}, (e, m) => {
  handler.displayResult(e, m);
});

import event from './event.json';
import handler from '../handler';
import index from './../../index';

index.getCookbooks(event, {}, (e, m) => {
  handler.displayResult(e, m);
});

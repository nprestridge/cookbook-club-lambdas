import index from './../../index';
import event from './event.json';

index.createCookbook(event, {}, (e, m) => {
  if (e) {
    console.log('ERROR', e);
    return;
  }

  console.log(m);
});

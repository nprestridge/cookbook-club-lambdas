import index from './../../index';
import event from './event.json';

index.getCookbookRecipes(event, {}, (e, m) => {
  if (e) {
    console.log('ERROR', e);
    return;
  }

  console.log(m);
});

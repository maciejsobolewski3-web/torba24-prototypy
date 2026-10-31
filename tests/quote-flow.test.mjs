import test from 'node:test';
import assert from 'node:assert/strict';
import {makeQuoteDraft} from '../order/store.js';
test('one or several configured bags keep artwork and options in an explicitly unsent draft',()=>{
 const bag={id:'bag-1',quantity:100,configuration:{options:{cord:{value:'red'}}},faces:{front:{blob:new Blob(['logo'])}}};
 for(const items of [[bag],[bag,{...bag,id:'bag-2'}]]){
  const draft=makeQuoteDraft(items,{name:'Test',email:'test@example.com'});
  assert.equal(draft.status,'saved-locally');assert.equal(draft.kind,'quote-draft');
  assert.deepEqual(draft.items,items);assert.equal(draft.items[0].faces.front.blob.size,4);
 }
 assert.throws(()=>makeQuoteDraft([],{name:'Test',email:'test@example.com'}));
 assert.throws(()=>makeQuoteDraft([{...bag,quantity:0}],{name:'Test',email:'test@example.com'}));
 assert.throws(()=>makeQuoteDraft([bag],{name:'',email:''}));
});

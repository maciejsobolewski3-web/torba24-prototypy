import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog,productById,resolveCurrentProduct,resolveProduct,defaults,configuration,valuesFrom,dimensions,validate,normalizeValues,activeFields} from '../configuration/config.js';
import {makeQuoteDraft} from '../order/store.js';
test('merchant scope excludes unsupported constructions and uses stock colour instead of arbitrary RGB',()=>{
 assert.deepEqual(catalog.products.map(p=>p.id),['papier-plaski','papier-skrecany','bawelna','bawelna-krotkie','bawelna-dno','bawelna-boki']);
 for(const p of catalog.products){
  assert.ok(!p.fields.some(f=>['finish','cord','ribbon','dtfSize'].includes(f.id)));
  for(const row of p.variantMatrix){
   const v=normalizeValues(p,{...defaults(p),...row}),saved=configuration(p,v,'#ff00ff');
   assert.notEqual(saved.bodyColor,'#ff00ff');assert.equal(validate(p,v,100),'');
   for(const f of activeFields(p,v))assert.equal(valuesFrom(saved)[f.id],v[f.id]);
   assert.ok(dimensions(p,v).height>0);assert.equal(saved.productionStatus,'reference-proposal');
  }
 }
 const p=productById('papier-plaski');assert.ok(validate(p,{...defaults(p),stockColor:'zielony'},100));
});
test('old artwork can reopen with its original model, but retired SKUs cannot be submitted as current offer',()=>{
 const old='torby-papierowe-laminowane-m';
 assert.equal(resolveProduct(old).family,'laminated');assert.equal(productById(old),undefined);
 assert.equal(resolveCurrentProduct(old).id,'papier-skrecany');
 assert.deepEqual(dimensions({family:'cotton',size:'38×42+10+10 cm',fields:[]},{}),{width:38,height:42,depth:10,label:'38×42+10+10 cm'});
 const contact={name:'Test',email:'test@example.com'};
 assert.throws(()=>makeQuoteDraft([{quantity:100,configuration:{productId:old}}],contact),/spoza aktualnej oferty/);
 const p=productById('papier-skrecany');
 assert.equal(makeQuoteDraft([{quantity:100,configuration:configuration(p,defaults(p),'#ff00ff')}],contact).status,'saved-locally');
});

test('format changes keep only observed stock combinations and print-specific settings',()=>{
 const p=productById('papier-skrecany');
 for(const size of p.fields.find(f=>f.id==='size').options){
  const v=normalizeValues(p,{...defaults(p),size:size.id,stockColor:'pastelowa-rozowa'});
  assert.ok(p.variantMatrix.some(row=>row.size===v.size&&row.stockColor===v.stockColor));
 }
 const c=productById('bawelna-dno'),v=normalizeValues(c,{size:'45x12x35',stockColor:'bialy',weight:'145'});
 assert.equal(v.weight,'280');assert.equal(v.stockColor,'naturalny');
 assert.equal(dimensions(productById('bawelna-boki'),defaults(productById('bawelna-boki'))).height,42);
 const digital={...defaults(c),printing:'digital'};assert.ok(activeFields(c,digital).some(f=>f.id==='digitalFormat'));assert.ok(!activeFields(c,digital).some(f=>f.id==='inkCount'));
});

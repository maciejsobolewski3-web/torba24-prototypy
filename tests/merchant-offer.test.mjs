import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog,productById,resolveCurrentProduct,resolveProduct,defaults,configuration,valuesFrom,dimensions,validate,normalizeValues,activeFields} from '../configuration/config.js';
import {makeQuoteDraft} from '../order/store.js';
test('merchant scope excludes unsupported constructions and uses stock colour instead of arbitrary RGB',()=>{
 assert.deepEqual(catalog.products.map(p=>p.id),['papier-plaski','papier-skrecany','bawelna','bawelna-krotkie','bawelna-dno','bawelna-boki','juta','workoplecak','papier-catering','pizza-45','pizza-32','serwetki']);
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
 assert.throws(()=>makeQuoteDraft([{quantity:100,configuration:{...configuration(p,defaults(p)),catalogVersion:'2026-10-31-offer-32'}}],contact),/Parametry oferty zostały/);
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
 const saved=configuration(c,defaults(c));assert.equal(saved.printing.id,'dtf');assert.equal(saved.printing.status,'proposed');assert.ok(!activeFields(c,defaults(c)).some(f=>['printing','digitalFormat','inkCount'].includes(f.id)));
});

test('packaging has one print surface, fixed pizza colours, and no invented production format',async()=>{
 const {backAllowed,inventoryKey,printingFor}=await import('../configuration/config.js');
 for(const id of ['pizza-45','pizza-32','serwetki']){const p=productById(id),v=defaults(p);assert.equal(backAllowed(p,v,[{type:'printSides'}]),false);assert.equal(p.fields.find(f=>f.id==='stockColor').options.length,1);}
 assert.equal(configuration(productById('pizza-45'),defaults(productById('pizza-45'))).options.stockColor.display,'Biały');
 assert.equal(configuration(productById('pizza-32'),defaults(productById('pizza-32'))).options.stockColor.display,'Szary kraft');
 for(const id of ['juta','serwetki'])assert.match(dimensions(productById(id),defaults(productById(id))).label,/ustalenia/);
 const p=productById('papier-catering'),v=defaults(p);assert.equal(inventoryKey(p,v),inventoryKey(productById('papier-plaski'),v));
 assert.equal(printingFor(productById('workoplecak'),defaults(productById('workoplecak'))).id,'dtf');
 const paper=productById('papier-skrecany');assert.equal(printingFor(paper,{...defaults(paper),stockColor:'czarny'}).status,'to-confirm');
});

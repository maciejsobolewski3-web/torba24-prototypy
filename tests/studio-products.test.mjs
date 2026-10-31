import test from 'node:test';
import assert from 'node:assert/strict';
import {studioDefaults} from '../studio-3d/product-controls.js';
import {catalog,configuration,baseColor,valuesFrom,validate,activeFields} from '../configuration/config.js';
test('every catalog model opens with valid printable studio parameters',()=>{
 for(const p of catalog.products){
  const v=studioDefaults(p);
  assert.equal(validate(p,v,100),'',p.id);
  const mode=p.fields.find(f=>f.id==='printMode');
  if(mode)assert.notEqual(mode.options.find(o=>o.id===v.printMode).label,'bez nadruku',p.id);
  const saved=configuration(p,v,baseColor(p));
  assert.equal(saved.productId,p.id);assert.ok(saved.dimensions.width>0&&saved.dimensions.height>0);
  for(const f of activeFields(p,v))assert.equal(valuesFrom(saved)[f.id],v[f.id]);
 }
});
test('cotton defaults to full-colour printing without unrelated rear ink options',()=>{
 const p=catalog.products.find(p=>p.family==='cotton');
 const c=configuration(p,studioDefaults(p),baseColor(p));
 assert.match(c.options.printMode.display,/DTF/);assert.ok(c.options.dtfSize);assert.equal(c.options.inkBack,undefined);
});

import catalog from '../configuration/catalog-bagpack-archive.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {defaults,activeFields,configuration,valuesFrom,validate,dimensions,resolveProduct,productById,bagSVG,linkedSides,backAllowed} from '../configuration/config.js';
import {price,needsQuote,validQuantity,productFormat,productName} from '../order/store.js';
const byFamily=f=>catalog.products.find(p=>p.family===f);
test('109 observed products, all option lists match the captured source',async()=>{
 const audit=JSON.parse(await readFile(new URL('../research/bagpack-2026-10-31/observed-options.json',import.meta.url)));
 assert.equal(catalog.products.length,109);assert.equal(new Set(catalog.products.map(p=>p.id)).size,109);
 for(const p of catalog.products){const source=audit.products.find(s=>s.url===p.source);assert.ok(source);assert.equal(p.fields.length,source.selectors.length);p.fields.forEach((f,i)=>assert.deepEqual(f.options.map(o=>o.label),source.selectors[i].options.filter(o=>o.value&&!o.label.includes('Wybierz opcj')).map(o=>o.label)));assert.equal(validate(p,defaults(p),100),'');assert.ok(dimensions(p,defaults(p)).height>0);}
});
test('laminated / eco / gift box have different available options',()=>{
 const lam=byFamily('laminated'),eco=byFamily('premium-kraft'),gift=byFamily('giftbox');
 assert.equal(lam.fields.find(f=>f.id==='cord').options.length,24);assert.equal(eco.fields.find(f=>f.id==='cord').options.length,5);assert.ok(!eco.fields.some(f=>f.id==='finish'));assert.equal(gift.fields.find(f=>f.id==='ribbon').options.length,21);
});
test('print dependencies remove inactive values from the saved payload',()=>{
 const p=byFamily('kraft'),v=defaults(p);v.printMode=p.fields.find(f=>f.id==='printMode').options.find(o=>o.label.includes('różne')).id;v.inkFront='2';v.inkBack='3';
 assert.ok(activeFields(p,v).some(f=>f.id==='inkBack'));assert.ok(backAllowed(p,v));
 v.printMode=p.fields.find(f=>f.id==='printMode').options.find(o=>o.label.includes('taki sam')).id;assert.ok(linkedSides(p,v));assert.ok(!activeFields(p,v).some(f=>f.id==='inkBack'));
 v.printMode='bez-nadruku';const c=configuration(p,v,'#ffffff');assert.ok(!c.options.inkFront);assert.ok(!c.options.inkBack);assert.ok(!backAllowed(p,v));
});
test('DTF differs from screen printing, bottle bags do not inherit unsupported screen printing',()=>{
 const p=byFamily('cotton'),v=defaults(p);v.printMode=p.fields.find(f=>f.id==='printMode').options.find(o=>o.label.includes('DTF')).id;assert.ok(activeFields(p,v).some(f=>f.id==='dtfSize'));assert.ok(!activeFields(p,v).some(f=>f.id==='inkFront'));
 const bottles=catalog.products.filter(p=>p.name.includes('butelkę'));assert.equal(bottles.length,2);assert.ok(bottles.every(p=>!p.fields.some(f=>f.id==='inkFront')));
 assert.equal(byFamily('jute').fields.find(f=>f.id==='inkFront').options.length,1);
});
test('payload round trip keeps dimensions, cord, finish and custom requests; no supplier price',()=>{
 const p=byFamily('laminated'),v=defaults(p);v.size='24x9x26';v.cord='czerwony';v.finish='folia-mat';const c=configuration(p,v,'#164f3c',[{type:'finish',value:'Hot stamping'}]);
 const saved=JSON.parse(JSON.stringify(c));assert.deepEqual(valuesFrom(saved),v);assert.equal(saved.dimensions.width,24);assert.equal(saved.dimensions.depth,9);assert.equal(saved.dimensions.height,26);
 const project={configuration:saved,preset:'green',quantity:100};assert.equal(price(project),null);assert.equal(needsQuote(project),true);assert.equal(productFormat(project),'24x9x26 cm');assert.equal(productName(project),p.name);
});
test('invalid option and quantity rejected, legacy project pricing still readable',()=>{
 const p=byFamily('laminated');assert.ok(validate(p,{...defaults(p),cord:'not-a-color'},100));assert.ok(validate(p,defaults(p),1.5));assert.ok(validate(p,defaults(p),0));assert.ok(validate(p,defaults(p),100001));assert.equal(validQuantity(1,{configuration:{}}),true);assert.equal(validQuantity(1,{}),false);
 const legacy={quantity:100,preset:'green',faces:{front:{kind:'image'},back:{kind:'none'}}};assert.equal(price(legacy).total,69000);assert.equal(productFormat(legacy),'32 × 12 × 26 cm');
});
test('front elevations have meaningful dimensions and safe output',()=>{
 for(const p of catalog.products){const v=defaults(p),d=dimensions(p,v);assert.ok(!Number.isNaN(d.width));assert.ok(!bagSVG(p,v).includes('NaN'));assert.ok(!bagSVG(p,v).includes('undefined'));}
 const drawstring=byFamily('drawstring');assert.equal(dimensions(drawstring,defaults(drawstring)).height,40);
 assert.equal(resolveProduct('cotton').family,'cotton');assert.equal(resolveProduct('kraft').family,'kraft');assert.equal(resolveProduct('white').family,'kraft');assert.equal(resolveProduct('cotton-green').family,'cotton');
});

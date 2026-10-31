import test from 'node:test';
import assert from 'node:assert/strict';
import {filterBases} from '../studio-3d/base-picker.js';
import {catalog} from '../configuration/config.js';
test('base selection exposes the entire catalog and combines material, colour and format searches',()=>{
 assert.equal(filterBases(catalog.products).length,109);
 for(const family of catalog.families)assert.deepEqual(filterBases(catalog.products,{family:family.id}),catalog.products.filter(p=>p.family===family.id));
 const cotton=filterBases(catalog.products,{family:'cotton',query:'38 × 42 dlugie'});
 assert.ok(cotton.length>0);assert.ok(cotton.every(p=>p.family==='cotton'&&p.id.includes('dlugie')));
 const p=catalog.products.find(p=>p.family==='cotton'&&p.specs.Kolor);
 assert.ok(filterBases(catalog.products,{family:'cotton',color:p.specs.Kolor}).every(x=>x.specs.Kolor===p.specs.Kolor));
 const size=catalog.products.find(p=>p.family==='laminated').fields.find(f=>f.id==='size').options[0].label;
 assert.ok(filterBases(catalog.products,{family:'laminated',query:size}).length>0);
 assert.equal(filterBases(catalog.products,{query:'brak-takiej-torby-xyz'}).length,0);
});

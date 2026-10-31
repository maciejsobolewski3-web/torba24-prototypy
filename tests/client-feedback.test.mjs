import test from 'node:test';
import assert from 'node:assert/strict';
import {matchesProduct} from '../configuration/catalog-filter.js';
import {catalog,normalizeValues} from '../configuration/config.js';
test('catalog filters match one actual size/color variant, not unrelated options',()=>{
 const p=catalog.products.find(p=>p.id==='papier-skrecany');
 for(const size of p.fields.find(f=>f.id==='size').options)for(const color of p.fields.find(f=>f.id==='stockColor').options){
  assert.equal(matchesProduct(p,{size:size.id,color:color.id}),p.variantMatrix.some(v=>v.size===size.id&&v.stockColor===color.id));
 }
 assert.ok(matchesProduct(p,{query:'papier',handle:'skręcany',family:'paper'}));
 assert.ok(!matchesProduct(p,{handle:'płaski'}));
});
test('white paper presets remain white for both handle constructions',()=>{
 for(const id of ['papier-plaski','papier-skrecany']){
  const p=catalog.products.find(p=>p.id===id);
  assert.equal(normalizeValues(p,{stockColor:'bialy'}).stockColor,'bialy');
 }
});
import {quotePrice,pricingKey,catalogPriceLabel} from '../configuration/pricing.js';
test('merchant pricing requires an approved unexpired exact tariff and prices quantity and printed sides',()=>{
 const configuration={productId:'papier-plaski',options:{size:{value:'18x8x23'},stockColor:{value:'bialy'}},requests:[]},p={configuration,quantity:100,faces:{front:{kind:'image'},back:{kind:'none'}}};
 const now=Date.parse('2026-10-31'),tariff={approved:true,currency:'PLN',validUntil:'2026-11-01',rows:[{id:'TEST-FIXTURE-ONLY',key:pricingKey(configuration),printedSides:1,minQuantity:100,maxQuantity:500,unitNet:100,setupNet:1000,vatPercent:23}]};
 assert.equal(quotePrice(p),null);assert.equal(catalogPriceLabel({id:'papier-plaski'}),'Cena na zapytanie');
 assert.equal(quotePrice(p,tariff,now).total,13530);
 assert.equal(quotePrice({...p,quantity:200},tariff,now).total,25830);
 assert.equal(quotePrice({...p,quantity:99},tariff,now),null);
 assert.equal(quotePrice({...p,faces:{front:{kind:'image'},back:{kind:'image'}}},tariff,now),null);
 assert.equal(quotePrice(p,{...tariff,approved:false},now),null);
 assert.equal(quotePrice(p,tariff,Date.parse('2026-11-02')),null);
 assert.equal(quotePrice(p,{...tariff,rows:[...tariff.rows,...tariff.rows]},now),null);
 assert.equal(quotePrice({...p,configuration:{...configuration,requests:[{type:'format',value:'custom'}]}},tariff,now),null);
});

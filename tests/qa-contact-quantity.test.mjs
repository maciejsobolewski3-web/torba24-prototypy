import test from 'node:test';
import assert from 'node:assert/strict';
import {contactModel,validOrderQuantity,polishCount} from '../store-ui.js';
import {catalog,aliases} from '../configuration/config.js';
test('contact aliases retain the intended model and unknown links do not select a random product',()=>{
 for(const [id,expected] of [['premium','papier-skrecany'],['cotton','bawelna'],['white','papier-plaski'],['papier-catering','papier-catering']])assert.equal(contactModel(id,catalog.products,aliases),expected);
 for(const unknown of [null,'missing','constructor','__proto__'])assert.equal(contactModel(unknown,catalog.products,aliases),'');
});
test('all entry points reject empty, zero, fractional and excessive quantities',()=>{
 for(const value of ['',0,-1,'0','1.5','100001','NaN',Infinity])assert.equal(validOrderQuantity(value),false,String(value));
 for(const value of [1,'100',100000])assert.equal(validOrderQuantity(value),true,String(value));
});
test('Polish counts handle singular, few and teens',()=>{
 assert.equal(polishCount(1,'wariant','warianty','wariantów'),'1 wariant');
 assert.equal(polishCount(4,'wariant','warianty','wariantów'),'4 warianty');
 assert.equal(polishCount(12,'wariant','warianty','wariantów'),'12 wariantów');
 assert.equal(polishCount(22,'wariant','warianty','wariantów'),'22 warianty');
});

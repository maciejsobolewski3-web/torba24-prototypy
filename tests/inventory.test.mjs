import test from 'node:test';
import assert from 'node:assert/strict';
import {availability,combinedQuantity} from '../configuration/inventory.js';
const now=Date.parse('2026-10-31T12:00:00Z'),config={stockKey:'paper|size=24|stockColor=bialy'};
const entry={available:100,allowBackorder:true,restockAt:'2026-11-03T12:00:00Z',validUntil:'2026-10-31T13:00:00Z'};
const records=r=>({[config.stockKey]:r});
test('unknown, expired and malformed inventory never becomes a stock or delivery promise',()=>{
 assert.equal(availability(config,100,{},now).status,'unknown');
 for(const row of [{...entry,validUntil:'2026-10-30'},{...entry,available:-1},{...entry,available:'100'}])assert.equal(availability(config,100,records(row),now).status,'unknown');
 assert.equal(availability(config,NaN,records(entry),now).status,'unknown');
});
test('backorders distinguish replenishment from print/shipping and discard stale ETA',()=>{
 assert.equal(availability(config,100,records(entry),now).status,'available');
 const back=availability(config,200,records(entry),now);assert.equal(back.status,'backorder');assert.match(back.title,/100 szt/);assert.match(back.message,/3.11.2026.*Następnie nadruk/);
 assert.match(availability(config,200,records({...entry,restockAt:'2026-10-29'}),now).message,/Termin uzupełnienia zapasu potwierdzimy/);
 assert.equal(availability(config,200,records({...entry,allowBackorder:false}),now).status,'unavailable');
});
test('different prints consume one shared physical-stock pool',()=>{
 const a={configuration:config,quantity:60},b={configuration:config,quantity:70},c={configuration:{stockKey:'other'},quantity:100};
 assert.equal(combinedQuantity(a,[a,b,c]),130);
 assert.equal(availability(config,combinedQuantity(a,[a,b,c]),records(entry),now).status,'backorder');
});

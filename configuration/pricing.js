// Fill with the merchant's approved tariff, or replace this boundary with Joomla.
// All amounts are integer grosze. Never populate this using competitor prices.
export const merchantTariff={approved:false,currency:'PLN',validUntil:null,rows:[]};
export function pricingKey(configuration){
 return JSON.stringify([configuration.productId,Object.entries(configuration.options||{}).sort(([a],[b])=>a.localeCompare(b)).map(([key,o])=>[key,o.value])]);
}
export function quotePrice(project,tariff=merchantTariff,now=Date.now()){
 const c=project.configuration,q=Number(project.quantity);
 if(!c||c.requests?.length||!Number.isInteger(q)||q<1||q>100000||!tariff.approved||tariff.currency!=='PLN'||!(Date.parse(tariff.validUntil)>now))return null;
 const printedSides=Object.values(project.faces||{}).filter(f=>f.kind&&f.kind!=='none').length;
 const rows=tariff.rows.filter(r=>r.key===pricingKey(c)&&r.printedSides===printedSides&&q>=r.minQuantity&&q<=r.maxQuantity);
 // Overlapping / incomplete ranges must not silently pick a cheaper record.
 if(rows.length!==1)return null;
 const r=rows[0];if(![r.unitNet,r.setupNet,r.vatPercent,r.minQuantity,r.maxQuantity].every(Number.isInteger)||r.unitNet<0||r.setupNet<0||r.vatPercent<0||r.vatPercent>100)return null;
 const net=r.unitNet*q+r.setupNet,vat=Math.round(net*r.vatPercent/100),total=net+vat;
 return {net,vat,total,unit:total/q,currency:'PLN',source:'merchant',tariffId:r.id};
}
export function catalogPriceLabel(product,tariff=merchantTariff,now=Date.now()){
 if(!tariff.approved||tariff.currency!=='PLN'||!(Date.parse(tariff.validUntil)>now))return 'Cena na zapytanie';
 const rows=tariff.rows.filter(r=>{try{return JSON.parse(r.key)[0]===product.id;}catch{return false;}}).filter(r=>r.setupNet===0&&Number.isInteger(r.unitNet)&&r.unitNet>=0&&Number.isInteger(r.vatPercent)&&r.vatPercent>=0&&r.vatPercent<=100);
 if(!rows.length)return 'Cena na zapytanie';
 const cents=Math.min(...rows.map(r=>Math.round(r.unitNet*(1+r.vatPercent/100))));
 return 'od '+new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN'}).format(cents/100)+' / szt. brutto';
}

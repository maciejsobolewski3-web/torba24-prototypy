import {escape} from './config.js?v=client-34';
// Joomla supplies available units AFTER reservations. Empty means unknown, not zero.
export const inventoryRecords = {};
export function availability(config,quantity,records=inventoryRecords,now=Date.now()){
 const unknown={status:'unknown',title:'Dostępność do potwierdzenia',message:'Stan bazy i termin realizacji potwierdzimy przy wycenie.'};
 const r=records[config?.stockKey],qty=Number(quantity);
 if(!r||!Number.isFinite(r.available)||r.available<0||!Number.isInteger(qty)||qty<1||!Number.isFinite(Date.parse(r.validUntil))||Date.parse(r.validUntil)<=now)return unknown;
 if(r.available>=qty)return {status:'available',title:`Dostępne: ${r.available} szt.`,message:'Baza na stanie. Termin nadruku i wysyłki ustalimy osobno.'};
 const shortage=qty-r.available;
 if(!r.allowBackorder)return {status:'unavailable',title:`Brakuje ${shortage} szt. do tego nakładu`,message:'Ten wariant wymaga potwierdzenia dostawy przed zamówieniem.'};
 const eta=Date.parse(r.restockAt);
 return {status:'backorder',title:`Na zamówienie · oczekujemy na ${shortage} szt.`,message:Number.isFinite(eta)&&eta>now?`Przewidywane uzupełnienie zapasu: ${new Date(eta).toLocaleDateString('pl-PL',{timeZone:'Europe/Warsaw'})}. Następnie nadruk i wysyłka.`:'Termin uzupełnienia zapasu potwierdzimy. Nadruk i wysyłka nastąpią po dostawie bazy.'};
}
export function combinedQuantity(project,items){return project.configuration?.stockKey?items.filter(p=>p.configuration?.stockKey===project.configuration.stockKey).reduce((sum,p)=>sum+Number(p.quantity),0):Number(project.quantity);}
export function availabilityHTML(config,quantity,records=inventoryRecords){const a=availability(config,quantity,records);return `<div class="stock-note" data-stock-status="${a.status}"><strong>${escape(a.title)}</strong><p>${escape(a.message)}</p></div>`;}

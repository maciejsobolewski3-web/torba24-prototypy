import {productById,catalog} from '../configuration/config.js?v=merchant-33';
// Files and projects stay on this device. Never serialize temporary blob URLs.
let database;
function open(){
  return database ||= new Promise((resolve,reject)=>{
    const request=indexedDB.open('printbag24-studio',1);
    request.onupgradeneeded=()=>{for(const name of ['projects','cart','receipts'])request.result.createObjectStore(name,{keyPath:'id'});};
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>{database=null;reject(request.error);};
  });
}
async function transaction(names,mode,run){
  const db=await open();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(names,mode);let result;
    tx.oncomplete=()=>resolve(result);tx.onerror=tx.onabort=()=>reject(tx.error||new Error('Nie udało się zapisać projektu.'));
    run(tx,value=>{result=value;});
  });
}
export const get=(store,id)=>transaction([store],'readonly',(tx,done)=>{const r=tx.objectStore(store).get(id);r.onsuccess=()=>done(r.result);});
export const list=store=>transaction([store],'readonly',(tx,done)=>{const r=tx.objectStore(store).getAll();r.onsuccess=()=>done(r.result);});
export const put=(store,value)=>transaction([store],'readwrite',tx=>tx.objectStore(store).put(value));
export const remove=(store,id)=>transaction([store],'readwrite',tx=>tx.objectStore(store).delete(id));
export const id=()=>crypto.randomUUID();
export async function addToCart(project){
  await transaction(['projects','cart'],'readwrite',tx=>{tx.objectStore('projects').put(project);tx.objectStore('cart').put({...project,addedAt:Date.now()});});
}
export async function complete(items,kind,contact={}){
  const receipt={id:id(),createdAt:Date.now(),kind,items,contact};
  await transaction(['cart','receipts'],'readwrite',tx=>{
    tx.objectStore('receipts').put(receipt);
    for(const item of items)tx.objectStore('cart').delete(item.id);
  });
  return receipt;
}
export const money=cents=>new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN'}).format(cents/100);
export const validQuantity=(n,p)=>Number.isInteger(Number(n))&&Number(n)>=(p?.configuration?1:50)&&Number(n)<=(p?.configuration?100000:10000);
export const needsQuote=p=>!!p.configuration||!p.preset;
export const productName=p=>p.configuration?.productName||'Papier premium';
export const productFormat=p=>p.configuration?.dimensions?.label||format;
// Illustrative gross prices only. Replace with a server-validated merchant tariff.
export function price(p){
  if(needsQuote(p))return null;
  const q=Number(p.quantity),sides=Object.values(p.faces).filter(f=>f.kind!=='none').length;
  const base=q>=500?490:q>=250?590:q>=100?690:790;
  const unit=base+Math.max(0,sides-1)*90;
  return {unit,total:unit*q};
}
export const shipping=1900;
export const format='32 × 12 × 26 cm';
export const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// Local draft only: backend delivery must never be inferred from this receipt.
export function makeQuoteDraft(items,contact){
  if(!items.length||items.some(p=>!validQuantity(p.quantity,p)))throw new Error('Sprawdź warianty i nakład.');
  if(items.some(p=>p.configuration?.productId&&!productById(p.configuration.productId)))throw new Error('W koszyku jest model spoza aktualnej oferty. Otwórz jego edycję i wybierz nową bazę; nadruki zostaną zachowane.');
  if(items.some(p=>p.configuration?.catalogVersion&&p.configuration.catalogVersion!==catalog.auditedAt))throw new Error('Parametry oferty zostały zaktualizowane. Otwórz edycję każdego wcześniejszego projektu i ponownie zapisz wariant.');
  if(!contact.name?.trim()||!contact.email?.trim())throw new Error('Uzupełnij dane kontaktowe.');
  return {id:id(),createdAt:Date.now(),kind:'quote-draft',status:'saved-locally',items,contact};
}

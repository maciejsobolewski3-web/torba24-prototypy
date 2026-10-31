import {mountStandaloneShell} from '../brand-shell.js?v=nav-27';
mountStandaloneShell();
import {get,list,put,remove,id,addToCart,makeQuoteDraft,money,price,needsQuote,shipping,format,esc,validQuantity,productName,productFormat} from './store.js?v=flow-26';
const root=document.querySelector('#order-main'),status=document.querySelector('#order-status');
const params=new URLSearchParams(location.search),step=params.get('step')||'cart';
let cart=[],checkoutItems=[],receipt,busy=false,undoItem,quantitySaving=null;
const href=(step,extra={})=>'?'+new URLSearchParams({step,...extra});
const editor=(p,from='review')=>`../studio-3d/?project=${encodeURIComponent(p.id)}&from=${from}`;
const projectCount=n=>`${n} ${n===1?'projekt':n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?'projekty':'projektów'}`;
const faceName=s=>s==='front'?'Przód':'Tył';
const printName=f=>f.kind==='none'?'Bez nadruku':f.kind==='example'?'Tekst startowy':f.name;
const hasExample=p=>Object.values(p.faces).some(f=>f.kind==='example');
const total=items=>items.reduce((sum,p)=>sum+(price(p)?.total||0),0);
const steps=n=>`<ol class="order-steps" aria-label="Etapy wyceny">${['Wybierz torbę','Dopasuj projekt','Dane do wyceny'].map((label,i)=>`<li ${i===n?'aria-current="step"':''}><b>${i+1}</b>${label}</li>`).join('')}</ol>`;
const title=(eyebrow,heading,copy)=>`<div class="order-title"><span class="studio-eyebrow">${eyebrow}</span><h1>${heading}</h1><p>${copy}</p></div>`;
const badge=p=>`<span class="pill ${needsQuote(p)?'quote':''}">${needsQuote(p)?'KONFIGURACJA DO WYCENY':'WARIANT STANDARDOWY'}</span>`;
function details(p){return `<dl><div><dt>Model</dt><dd>${esc(productName(p))}</dd></div><div><dt>Format</dt><dd>${esc(productFormat(p))}</dd></div><div><dt>Kolor</dt><dd>${esc(p.color.name)}<br>${esc(p.color.body.toUpperCase())}</dd></div><div><dt>Nakład</dt><dd>${p.quantity} szt.</dd></div><div><dt>Nadruk</dt><dd>${Object.entries(p.faces).filter(([,f])=>f.kind!=='none').map(([s])=>faceName(s)).join(' + ')||'Bez nadruku'}</dd></div>${p.configuration?Object.values(p.configuration.options).filter(o=>o.label!=='Format (cm)').map(o=>`<div><dt>${esc(o.label)}</dt><dd>${esc(o.display)}</dd></div>`).join('')+(p.configuration.requests||[]).map(r=>`<div><dt>Na zamówienie</dt><dd>${esc(r.value)}</dd></div>`).join(''):''}</dl>`;}
function views(p){return `<div class="review-views">${['front','back'].map(s=>`<figure class="review-view"><figcaption><b>${faceName(s)}</b><span>${p.faces[s].kind==='none'?'Bez nadruku':'Widok na wprost'}</span></figcaption><img src="${esc(p.thumbnails[s])}" alt="${faceName(s)} Twojej torby z zapisanym projektem"><div class="file-caption">${esc(printName(p.faces[s]))}</div></figure>`).join('')}</div>`;}
function priceBlock(p){const value=price(p);return `<div class="price-block"><span class="studio-eyebrow">${value?'WSTĘPNA WYCENA':'INDYWIDUALNA WYCENA'}</span><strong>${value?money(value.total):'Do potwierdzenia'}</strong><small>${value?`${money(value.unit)} / szt. · brutto · bez dostawy`:'Cena, minimalny nakład i termin wymagają potwierdzenia dla tej konfiguracji.'}</small></div>`;}
function notify(text){status.textContent=text;}
function errorPage(){root.innerHTML=`<section class="flow-card empty-cart"><h1>Nie udało się otworzyć projektu.</h1><p>Projekt jest dostępny tylko w przeglądarce, w której go zapisano. Sprawdź dostęp do pamięci witryny lub wróć do koszyka.</p><a class="button primary" href="?step=cart">Otwórz koszyk</a><a class="quiet-link" href="../studio-3d/">Zacznij nowy projekt</a></section>`;}
async function review(){
  const p=await get('projects',params.get('project'));
  if(!p){errorPage();return;}
  location.replace(editor(p));
}
function cartRow(p){const value=price(p);return `<article class="cart-row" data-item="${p.id}"><div class="cart-photos">${['front','back'].map(s=>`<figure><img src="${esc(p.thumbnails[s])}" alt="${faceName(s)} projektu"><figcaption>${faceName(s)}</figcaption></figure>`).join('')}</div><div>${badge(p)}<h2>${esc(productName(p))}</h2><p>${esc(productFormat(p))} · format<br>${esc(p.color.name)}${hasExample(p)?'<br>Tekst startowy':''}</p><p class="item-price">${value?`${money(value.total)} <small>· ${money(value.unit)} / szt.</small>`:'Cena po indywidualnej wycenie'}</p><div class="cart-controls"><label>Nakład <input aria-label="Nakład projektu ${esc(p.color.name)}" data-quantity="${p.id}" type="number" min="${p.configuration?1:50}" max="${p.configuration?100000:10000}" step="1" required value="${p.quantity}"> szt.</label><a href="${editor(p,'cart')}">Edytuj projekt</a><button data-copy="${p.id}">Kopiuj</button><button data-remove="${p.id}">Usuń</button></div></div></article>`;}
function legacy(){
  let items=[];try{items=JSON.parse(localStorage.getItem('printbag24-cart')||'[]');}catch{}
  if(!Array.isArray(items)||!items.length)return '';
  return `<aside class="notice legacy-note">Masz też ${projectCount(items.length)} w starszym konfiguratorze. Nie są częścią tego koszyka. Starsza wersja nie zachowuje plików logo.${items.map((p,i)=>`<a href="../creator/?cart=${i}">Otwórz wcześniejszy projekt ${i+1} (${esc(p.quantity)} szt.)</a>`).join('')}</aside>`;
}
async function renderCart(){
  cart=await list('cart');document.querySelector('#cart-count').textContent=`(${cart.length})`;document.title='Twoje warianty — Printbag24';
  root.innerHTML=steps(1)+title('KILKA POMYSŁÓW. JEDNO ZAPYTANIE.','Twoje warianty.','Zmień nakład, dopracuj projekt lub porównaj kilka wersji. Wyślesz je razem do wyceny.')+(cart.length?`<div class="order-grid"><div class="cart-list">${cart.map(cartRow).join('')}<a class="quiet-link" href="../catalog/">Dodaj kolejny wariant</a>${legacy()}</div><aside class="flow-card sticky"><span class="studio-eyebrow">PODSUMOWANIE</span><h2>${projectCount(cart.length)}.</h2><p>Cenę i termin potwierdzimy po sprawdzeniu parametrów.</p><a class="button primary" href="${href('quote')}">Przejdź do danych</a></aside></div>`:`<section class="flow-card empty-cart"><h2>Zacznij od swojej torby.</h2><p>Wybierz model i dodaj swój znak. Każdy wariant zachowa własne parametry i nadruk.</p><a class="button primary" href="../catalog/">Wybierz torbę</a></section>${legacy()}`);
}
function checkout(){
  checkoutItems=cart;
  if(!checkoutItems.length){location.replace(href('cart'));return;}
  document.title='Dane do wyceny — Printbag24';
  root.innerHTML=steps(2)+title('OSTATNI KROK','Gdzie przesłać wycenę?','Twój projekt jest już gotowy. Zostaw kontakt i dodaj uwagi, jeśli potrzebujesz.')+`<form id="checkout-form" class="order-grid quote-layout"><section class="flow-card"><h2>Dane kontaktowe</h2><div class="form-grid"><label>Imię i nazwisko<input name="name" autocomplete="name" required maxlength="120" placeholder="Jan Kowalski"></label><label>E-mail<input name="email" type="email" autocomplete="email" required maxlength="160" placeholder="jan@example.com"></label><label class="span-2">Firma (opcjonalnie)<input name="company" autocomplete="organization" maxlength="160" placeholder="Nazwa firmy"></label><label class="span-2">Uwagi (opcjonalnie)<textarea name="message" maxlength="2000" placeholder="Np. termin wydarzenia lub szczegóły nadruku…"></textarea></label></div><div class="quote-availability"><strong>Zapytanie zapiszesz na tym urządzeniu.</strong><p>Wysyłka do obsługi nie jest jeszcze dostępna. Projekt i wpisane dane pozostaną w tej przeglądarce.</p></div><button type="submit" class="button primary">Zapisz zapytanie</button><p class="fine-print">Ten krok nie wymaga płatności.</p></section><aside class="quote-projects"><div class="quote-summary-heading"><h2>${projectCount(checkoutItems.length)} do wyceny</h2><a class="quiet-link" href="?step=cart">Zmień warianty</a></div>${checkoutItems.map(p=>`<article class="flow-card quote-project"><div class="quote-project-top"><img src="${esc(p.thumbnails.front)}" alt="Przód projektu ${esc(productName(p))}"><div><h3>${esc(productName(p))}</h3><p>${esc(productFormat(p))} · ${p.quantity} szt.</p><a class="quiet-link" href="${editor(p,'cart')}">Edytuj projekt</a></div></div>${hasExample(p)?'<p class="notice warning">Na projekcie jest jeszcze napis „Twoja marka.”. Możesz zastąpić go swoim logo w studiu.</p>':''}<details><summary>Podgląd obu stron i parametry</summary>${views(p)}${details(p)}</details></article>`).join('')}</aside></form>`;
  const draft=readContact();for(const input of root.querySelectorAll('[name]'))input.value=draft[input.name]||'';
}
// Keep unfinished contact fields when the customer returns to adjust a bag.
const contactKey='printbag24-quote-contact';
function readContact(){try{return JSON.parse(sessionStorage.getItem(contactKey)||'{}');}catch{return {};}}
root.addEventListener('input',event=>{if(event.target.form?.id==='checkout-form'){try{sessionStorage.setItem(contactKey,JSON.stringify(Object.fromEntries(new FormData(event.target.form))));}catch{}}});

async function confirmation(){
  receipt=await get('receipts',params.get('receipt'));if(!receipt){errorPage();return;}
  if(receipt.kind==='quote-draft'){
    document.title='Zapytanie zapisane — Printbag24';
    root.innerHTML=`<section class="confirmation"><div class="flow-card"><span class="studio-eyebrow">TWOJE ZAPYTANIE</span><h1>Projekt zapisany.</h1><p>Zapytanie jest zapisane na tym urządzeniu. <strong>Nie zostało wysłane do obsługi.</strong> Wysyłka będzie dostępna po uruchomieniu obsługi zapytań.</p><div class="receipt-items">${receipt.items.map(p=>`<p><strong>${esc(productName(p))}</strong> · ${esc(productFormat(p))} · ${p.quantity} szt.</p>`).join('')}</div><a class="button primary" href="?step=cart">Wróć do swoich projektów</a><a class="quiet-link" href="../catalog/">Zaprojektuj kolejną torbę</a></div></section>`;return;
  }
  const quote=receipt.kind==='quote';
  document.title='Podsumowanie projektu — Printbag24';
  root.innerHTML=`<section class="confirmation"><div class="flow-card"><div class="success-symbol" aria-hidden="true">✓</div><span class="studio-eyebrow">PROJEKT / ${esc(receipt.id.slice(0,8).toUpperCase())}</span><h1>${quote?'Zapytanie przygotowane.':'Tak kończy się dobry projekt.'}</h1><p>${quote?'Pobierz projekty i prześlij je na info@easolution.pl. Na ich podstawie ustalimy cenę i termin realizacji.':'Projekt został zapisany na Twoim urządzeniu. Aby potwierdzić zamówienie, prześlij pobraną paczkę na info@easolution.pl lub zadzwoń: 17 230 54 10.'}</p><div class="receipt-items">${receipt.items.map(p=>`<p><strong>${esc(productName(p))} · ${p.quantity} szt.</strong> · ${esc(p.color.name)}</p>`).join('')}${!quote?`<p>Szacunkowa wartość z dostawą: <strong>${money(total(receipt.items)+shipping)}</strong></p>`:''}</div><button class="button primary" id="download-projects">Pobierz paczkę projektu</button><p class="fine-print">Paczka zawiera podglądy, ustawienia i pliki nadruków. Nie jest gotowym plikiem produkcyjnym. Do paczki dołączymy dane z formularza. Prześlij ją na info@easolution.pl.</p><div class="next-stages"><div><b>01 / Weryfikacja</b><p>Po otrzymaniu zapytania sprawdzimy pliki${quote?' i przygotujemy wycenę':''}.</p></div><div><b>02 / Twoja akceptacja</b><p>Finalny projekt do druku otrzymasz do zatwierdzenia.</p></div><div><b>03 / Produkcja i dostawa</b><p>Ruszą po zatwierdzeniu i potwierdzeniu warunków. </p></div></div><a class="quiet-link" href="?step=cart">Wróć do koszyka</a> · <a class="quiet-link" href="../studio-3d/">Zaprojektuj kolejną torbę</a></div></section>`;
}
root.addEventListener('submit',async event=>{
  event.preventDefault();if(busy)return;
  busy=true;const button=event.submitter;button.disabled=true;
  try{
    if(event.target.id==='checkout-form'){
      // Re-read to avoid completing a stale list after edits in another tab.
      const latest=await list('cart');
      if(JSON.stringify(latest.map(p=>[p.id,p.updatedAt,p.quantity]).sort())!==JSON.stringify(checkoutItems.map(p=>[p.id,p.updatedAt,p.quantity]).sort())){
        notify('Koszyk zmienił się w innej karcie. Sprawdź aktualne podsumowanie.');cart=await list('cart');checkout(step==='quote');return;
      }
      const saved=makeQuoteDraft(latest,Object.fromEntries(new FormData(event.target)));await put('receipts',saved);location.href=href('done',{receipt:saved.id});
    }
  }catch{notify('Nie udało się zapisać zmian. Projekt pozostaje w przeglądarce. Sprawdź pamięć witryny i spróbuj ponownie.');button.disabled=false;}finally{busy=false;}
});
async function updateQuantity(event){
  const key=event.target.dataset.quantity;if(!key)return;
  const p=cart.find(p=>p.id===key);if(!p||quantitySaving||Number(event.target.value)===p.quantity)return;
  if(!validQuantity(event.target.value,p)){event.target.value=p.quantity;notify(p.configuration?'Wybierz nakład od 1 do 100 000 szt.':'Wybierz nakład od 50 do 10 000 szt.');return;}
  quantitySaving=addToCart({...p,quantity:Number(event.target.value),updatedAt:Date.now()});
  try{await quantitySaving;await renderCart();notify('Nakład i wycena zaktualizowane.');}catch{event.target.value=p.quantity;notify('Nie udało się zapisać nakładu. Zachowano poprzednią wartość.');}finally{quantitySaving=null;}
}
root.addEventListener('change',updateQuantity);
root.addEventListener('focusout',updateQuantity);
root.addEventListener('click',async event=>{const a=event.target.closest('a');if(a&&quantitySaving){event.preventDefault();try{await quantitySaving;location.href=a.href;}catch{notify('Zapis nakładu nie powiódł się. Spróbuj ponownie.');}}},true);
root.addEventListener('click',async event=>{
  const b=event.target.closest('button');if(!b||busy)return;
  if(!b.dataset.copy&&!b.dataset.remove&&b.id!=='download-projects')return;
  busy=true;b.disabled=true;
  try{
    if(b.dataset.copy||b.dataset.remove){if(quantitySaving)await quantitySaving;cart=await list('cart');}
    if(b.dataset.copy){const p=cart.find(p=>p.id===b.dataset.copy);await addToCart({...p,id:id(),updatedAt:Date.now()});await renderCart();notify('Dodano niezależną kopię projektu. Możesz ją teraz edytować.');}
    if(b.dataset.remove){undoItem=cart.find(p=>p.id===b.dataset.remove);await remove('cart',undoItem.id);await renderCart();status.innerHTML='Projekt usunięty z koszyka. <button id="undo-remove">Cofnij</button>';}
    if(b.id==='download-projects'){
      const projects=[];
      for(const p of receipt.items){const faces={};for(const [side,face] of Object.entries(p.faces)){const {blob,...settings}=face;faces[side]={...settings,file:blob?await dataURL(blob):null};}projects.push({...p,faces});}
      const blob=new Blob([JSON.stringify({status:'prepared-locally',receipt:receipt.id,kind:receipt.kind,schemaVersion:2,contact:receipt.contact||{},projects},null,2)],{type:'application/json'});
      const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`printbag24-projekty-${receipt.id.slice(0,8)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);notify('Przygotowano paczkę projektów do pobrania.');
    }
  }catch{notify('Nie udało się wykonać operacji. Sprawdź dostęp do pamięci witryny i spróbuj ponownie.');}finally{busy=false;b.disabled=false;}
});
status.addEventListener('click',async event=>{if(event.target.id!=='undo-remove'||!undoItem||busy)return;busy=true;try{await addToCart(undoItem);undoItem=null;await renderCart();notify('Projekt przywrócony.');}catch{notify('Nie udało się przywrócić projektu.');}finally{busy=false;}});
function dataURL(blob){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob);});}
window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
try{
  cart=await list('cart');document.querySelector('#cart-count').textContent=`(${cart.length})`;
  if(step==='review')await review();else if(step==='checkout'||step==='quote')checkout(step==='quote');else if(step==='done')await confirmation();else await renderCart();
}catch{errorPage();}finally{root.dataset.ready="true";}

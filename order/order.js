import {mountStandaloneShell} from '../brand-shell.js?v=brand-7';
mountStandaloneShell();
import {get,list,put,remove,id,addToCart,complete,money,price,needsQuote,shipping,format,esc,validQuantity} from './store.js?v=brand-7';
const root=document.querySelector('#order-main'),status=document.querySelector('#order-status');
const params=new URLSearchParams(location.search),step=params.get('step')||'cart';
let currentProject,cart=[],checkoutItems=[],receipt,busy=false,undoItem,quantitySaving=null;
const href=(step,extra={})=>'?'+new URLSearchParams({step,...extra});
const editor=(p,from='review')=>`../studio-3d/?project=${encodeURIComponent(p.id)}&from=${from}`;
const projectCount=n=>`${n} ${n===1?'projekt':n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?'projekty':'projektów'}`;
const faceName=s=>s==='front'?'Przód':'Tył';
const printName=f=>f.kind==='none'?'Bez nadruku':f.kind==='example'?'Tekst startowy':f.name;
const hasExample=p=>Object.values(p.faces).some(f=>f.kind==='example');
const total=items=>items.reduce((sum,p)=>sum+(price(p)?.total||0),0);
const steps=n=>`<ol class="order-steps" aria-label="Etapy zamówienia">${['Projekt','Sprawdzenie','Koszyk','Dane'].map((label,i)=>`<li ${i===n?'aria-current="step"':''}><b>${i+1}</b>${label}</li>`).join('')}</ol>`;
const title=(eyebrow,heading,copy)=>`<div class="order-title"><span class="studio-eyebrow">${eyebrow}</span><h1>${heading}</h1><p>${copy}</p></div>`;
const badge=p=>`<span class="pill ${needsQuote(p)?'quote':''}">${needsQuote(p)?'WŁASNY KOLOR · DO WYCENY':'WARIANT STANDARDOWY'}</span>`;
function details(p){return `<dl><div><dt>Model</dt><dd>Papier premium</dd></div><div><dt>Format</dt><dd>${format}</dd></div><div><dt>Kolor</dt><dd>${esc(p.color.name)}<br>${esc(p.color.body.toUpperCase())}</dd></div><div><dt>Nakład</dt><dd>${p.quantity} szt.</dd></div><div><dt>Nadruk</dt><dd>${Object.entries(p.faces).filter(([,f])=>f.kind!=='none').map(([s])=>faceName(s)).join(' + ')||'Bez nadruku'}</dd></div></dl>`;}
function views(p){return `<div class="review-views">${['front','back'].map(s=>`<figure class="review-view"><figcaption><b>${faceName(s)}</b><span>${p.faces[s].kind==='none'?'Bez nadruku':'Widok na wprost'}</span></figcaption><img src="${esc(p.thumbnails[s])}" alt="${faceName(s)} Twojej torby z zapisanym projektem"><div class="file-caption">${esc(printName(p.faces[s]))}</div></figure>`).join('')}</div>`;}
function priceBlock(p){const value=price(p);return `<div class="price-block"><span class="studio-eyebrow">${value?'WSTĘPNA WYCENA':'INDYWIDUALNA WYCENA'}</span><strong>${value?money(value.total):'Do potwierdzenia'}</strong><small>${value?`${money(value.unit)} / szt. · brutto · bez dostawy`:'Własny kolor wymaga sprawdzenia możliwości produkcji. Cena nie jest jeszcze określona.'}</small></div>`;}
function notify(text){status.textContent=text;}
function errorPage(){root.innerHTML=`<section class="flow-card empty-cart"><h1>Nie udało się otworzyć projektu.</h1><p>Projekt jest dostępny tylko w przeglądarce, w której go zapisano. Sprawdź dostęp do pamięci witryny lub wróć do koszyka.</p><a class="button primary" href="?step=cart">Otwórz koszyk</a><a class="quiet-link" href="../studio-3d/">Zacznij nowy projekt</a></section>`;}
async function review(){
  currentProject=await get('projects',params.get('project'));if(!currentProject){errorPage();return;}
  const p=currentProject,inCart=cart.some(item=>item.id===p.id);
  document.title='Sprawdź projekt — Printbag24';
  root.innerHTML=steps(1)+title('JESZCZE JEDNO SPOJRZENIE','Wszystko na swoim miejscu?', 'Obejrzyj obie strony torby. Do koszyka trafi dokładnie ten projekt — razem z plikami, kolorem i położeniem nadruku.')+`<div class="order-grid"><div>${views(p)}<section class="flow-card review-notes"><h2>Dobry projekt zaczyna się od detalu.</h2><p>Sprawdź, czy wybrano właściwy plik i stronę nadruku. Wizualizacja pomaga ocenić kompozycję; nie stanowi zatwierdzenia pliku do druku. Format, materiał i końcowy kolor wymagają potwierdzenia.</p>${hasExample(p)?'<div class="notice warning">Na torbie jest przykładowy napis „Twoja marka.”. Wróć do studia, jeśli chcesz zastąpić go własnym logo.</div>':''}<a class="quiet-link" href="${editor(p)}">Wróć do edycji projektu</a></section></div><form id="review-form" class="flow-card sticky">${badge(p)}<h2>Twoja torba.<br>Twój projekt.</h2>${details(p)}${priceBlock(p)}<label class="check-row"><input type="checkbox" id="review-accept" required><span>Sprawdziłem projekt przodu i tyłu${hasExample(p)?' z tekstem startowym':''}.</span></label><button class="button primary" type="submit">${inCart?'Zapisz zmiany w koszyku':needsQuote(p)?'Dodaj do koszyka wycen':'Dodaj do koszyka'}</button><p class="fine-print">Możesz wrócić z koszyka do edycji. Twoje logo i ustawienia pozostaną na miejscu.</p></form></div>`;
}
function cartRow(p){const value=price(p);return `<article class="cart-row" data-item="${p.id}"><div class="cart-photos">${['front','back'].map(s=>`<figure><img src="${esc(p.thumbnails[s])}" alt="${faceName(s)} projektu"><figcaption>${faceName(s)}</figcaption></figure>`).join('')}</div><div>${badge(p)}<h2>Papier premium</h2><p>${format} · format<br>${esc(p.color.name)}${hasExample(p)?'<br>Tekst startowy':''}</p><p class="item-price">${value?`${money(value.total)} <small>· ${money(value.unit)} / szt.</small>`:'Cena po indywidualnej wycenie'}</p><div class="cart-controls"><label>Nakład <input aria-label="Nakład projektu ${esc(p.color.name)}" data-quantity="${p.id}" type="number" min="50" max="10000" step="1" required value="${p.quantity}"> szt.</label><a href="${editor(p,'cart')}">Edytuj projekt</a><button data-copy="${p.id}">Kopiuj</button><button data-remove="${p.id}">Usuń</button></div></div></article>`;}
function legacy(){
  let items=[];try{items=JSON.parse(localStorage.getItem('printbag24-cart')||'[]');}catch{}
  if(!Array.isArray(items)||!items.length)return '';
  return `<aside class="notice legacy-note">Masz też ${projectCount(items.length)} w starszym konfiguratorze. Nie są częścią tego koszyka. Starsza wersja nie zachowuje plików logo.${items.map((p,i)=>`<a href="../creator/?cart=${i}">Otwórz wcześniejszy projekt ${i+1} (${esc(p.quantity)} szt.)</a>`).join('')}</aside>`;
}
async function renderCart(){
  cart=await list('cart');document.querySelector('#cart-count').textContent=`(${cart.length})`;document.title='Twój koszyk — Printbag24';
  const standard=cart.filter(p=>!needsQuote(p)),quotes=cart.filter(needsQuote);
  root.innerHTML=steps(2)+title('GOTOWE NA KOLEJNY KROK','Twoja marka w koszyku.','Każda torba ma swój zapisany projekt. Zmień nakład, wróć do studia lub stwórz kopię dla kolejnego wariantu.')+(cart.length?`<div class="order-grid"><div class="cart-list">${cart.map(cartRow).join('')}<a class="quiet-link" href="../studio-3d/">Zaprojektuj kolejną torbę</a>${legacy()}</div><aside class="flow-card sticky"><span class="studio-eyebrow">PODSUMOWANIE</span><h2>Twój następny krok.</h2>${standard.length?`<div class="summary-line"><span>Torby standardowe (${standard.length})</span><b>${money(total(standard))}</b></div><div class="summary-line"><span>Dostawa</span><span>${money(shipping)}</span></div><div class="summary-line total"><span>Razem brutto<small>Wstępna wycena</small></span><span>${money(total(standard)+shipping)}</span></div><a class="button primary" href="${href('checkout')}">Przejdź do danych</a>`:''}${quotes.length?`<div class="notice">${projectCount(quotes.length)} z własnym kolorem — oczekiwanie na indywidualną wycenę. ${standard.length?'Nie są wliczone w kwotę powyżej.':''}</div><a class="button ${standard.length?'subtle':'primary'}" href="${href('quote')}">Przygotuj zapytanie o wycenę</a>`:''}<p class="fine-print">Ostateczną cenę i termin potwierdzimy przed rozpoczęciem produkcji.</p></aside></div>`:`<section class="flow-card empty-cart"><span class="studio-eyebrow">MIEJSCE NA TWÓJ POMYSŁ</span><h2>Pierwsza torba przed Tobą.</h2><p>Zaprojektuj ją na wprost w 2D, sprawdź w 3D i zapisz tutaj. Twoje logo będzie czekało razem z projektem.</p><a class="button primary" href="../studio-3d/">Zaprojektuj torbę</a></section>${legacy()}`);
}
function checkout(quote=false){
  checkoutItems=cart.filter(p=>needsQuote(p)===quote);
  if(!checkoutItems.length){location.replace(href('cart'));return;}
  const amount=total(checkoutItems)+shipping;
  document.title=(quote?'Zapytanie o wycenę':'Dane zamówienia')+' — Printbag24';
  root.innerHTML=steps(3)+title(quote?'DOPASUJEMY SZCZEGÓŁY':'JUŻ PRAWIE GOTOWE',quote?'Porozmawiajmy o Twojej torbie.':'Dokąd trafi Twoja seria?',quote?'Własny kolor wymaga potwierdzenia materiału i ceny. Przygotuj szczegóły projektu do indywidualnej wyceny.':'Uzupełnij dane do podsumowania i sprawdź szczegóły swojej konfiguracji.')+`<form id="checkout-form" class="order-grid"><div class="checkout-form"><section class="flow-card"><h2>${quote?'Kontakt do wyceny':'Twoje dane'}</h2><div class="form-grid"><label>Imię i nazwisko<input name="name" autocomplete="name" required maxlength="120" placeholder="Jan Kowalski"></label><label>E-mail<input name="email" type="email" autocomplete="email" required maxlength="160" placeholder="jan@example.com"></label><label class="span-2">Firma (opcjonalnie)<input name="company" autocomplete="organization" maxlength="160" placeholder="Nazwa firmy"></label>${quote?'<label class="span-2">Co powinniśmy wiedzieć? (opcjonalnie)<textarea name="message" maxlength="2000" placeholder="Zastosowanie, preferowany termin, odcień lub inne szczegóły…"></textarea></label>':'<label class="span-2">Ulica i numer<input name="address" autocomplete="street-address" required maxlength="160" placeholder="Przykładowa 12"></label><label>Kod pocztowy<input name="postal" autocomplete="postal-code" required pattern="[0-9]{2}-[0-9]{3}" title="Kod w formacie 00-000" placeholder="00-000"></label><label>Miasto<input name="city" autocomplete="address-level2" required maxlength="120" placeholder="Warszawa"></label>'}</div></section>${quote?'':`<section class="flow-card"><h2>Dostawa i płatność</h2><div class="delivery-option"><div><b>Kurier · Polska</b><span>Termin będzie zależał od zatwierdzenia projektu i produkcji.</span></div><b>${money(shipping)}</b></div><div class="notice"><strong>Płatność online</strong><br>Płatność online jest obecnie niedostępna. Zapisz podsumowanie i skontaktuj się z nami, aby potwierdzić zamówienie.</div></section>`}</div><aside class="flow-card sticky"><span class="studio-eyebrow">${quote?'PROJEKTY DO WYCENY':'TWÓJ PROJEKT'}</span><h2>${projectCount(checkoutItems.length)}.<br>${checkoutItems.reduce((sum,p)=>sum+p.quantity,0)} szt.</h2>${checkoutItems.map(p=>`<div class="summary-line"><span>Papier premium<br><small>${esc(p.color.name)} · ${p.quantity} szt.</small></span><b>${quote?'Do wyceny':money(price(p).total)}</b></div>`).join('')}${quote?'<p class="fine-print">Cena i termin zostaną określone po wycenie. Ten krok nie wymaga płatności.</p>':`<div class="summary-line"><span>Dostawa</span><span>${money(shipping)}</span></div><div class="summary-line total"><span>Razem brutto<small>Wstępna wycena</small></span><span>${money(amount)}</span></div>`}<label class="check-row"><input type="checkbox" required><span>Sprawdziłem dane i szczegóły projektu.</span></label><button type="submit" class="button primary">${quote?'Zapisz zapytanie':'Zapisz podsumowanie'}</button><a class="quiet-link" href="?step=cart">Wróć do koszyka</a></aside></form>`;
}
async function confirmation(){
  receipt=await get('receipts',params.get('receipt'));if(!receipt){errorPage();return;}
  const quote=receipt.kind==='quote';
  document.title='Podsumowanie projektu — Printbag24';
  root.innerHTML=`<section class="confirmation"><div class="flow-card"><div class="success-symbol" aria-hidden="true">✓</div><span class="studio-eyebrow">PROJEKT / ${esc(receipt.id.slice(0,8).toUpperCase())}</span><h1>${quote?'Zapytanie przygotowane.':'Tak kończy się dobry projekt.'}</h1><p>${quote?'Pobierz projekty i prześlij je na info@easolution.pl. Na ich podstawie ustalimy cenę i termin realizacji.':'Projekt został zapisany na Twoim urządzeniu. Aby potwierdzić zamówienie, prześlij pobraną paczkę na info@easolution.pl lub zadzwoń: 17 230 54 10.'}</p><div class="receipt-items">${receipt.items.map(p=>`<p><strong>Papier premium · ${p.quantity} szt.</strong> · ${esc(p.color.name)}</p>`).join('')}${!quote?`<p>Szacunkowa wartość z dostawą: <strong>${money(total(receipt.items)+shipping)}</strong></p>`:''}</div><button class="button primary" id="download-projects">Pobierz paczkę projektu</button><p class="fine-print">Paczka zawiera podglądy, ustawienia i pliki nadruków. Nie jest gotowym plikiem produkcyjnym. Do paczki dołączymy dane z formularza. Prześlij ją na info@easolution.pl.</p><div class="next-stages"><div><b>01 / Weryfikacja</b><p>Po otrzymaniu zapytania sprawdzimy pliki${quote?' i przygotujemy wycenę':''}.</p></div><div><b>02 / Twoja akceptacja</b><p>Finalny projekt do druku otrzymasz do zatwierdzenia.</p></div><div><b>03 / Produkcja i dostawa</b><p>Ruszą po zatwierdzeniu i potwierdzeniu warunków. </p></div></div><a class="quiet-link" href="?step=cart">Wróć do koszyka</a> · <a class="quiet-link" href="../studio-3d/">Zaprojektuj kolejną torbę</a></div></section>`;
}
root.addEventListener('submit',async event=>{
  event.preventDefault();if(busy)return;
  busy=true;const button=event.submitter;button.disabled=true;
  try{
    if(event.target.id==='review-form'){await addToCart(currentProject);location.href=href('cart');}
    if(event.target.id==='checkout-form'){
      // Re-read to avoid completing a stale list after edits in another tab.
      const latest=(await list('cart')).filter(p=>needsQuote(p)===(step==='quote'));
      if(JSON.stringify(latest.map(p=>[p.id,p.updatedAt,p.quantity]).sort())!==JSON.stringify(checkoutItems.map(p=>[p.id,p.updatedAt,p.quantity]).sort())){
        notify('Koszyk zmienił się w innej karcie. Sprawdź aktualne podsumowanie.');cart=await list('cart');checkout(step==='quote');return;
      }
      const saved=await complete(checkoutItems,step==='quote'?'quote':'purchase',Object.fromEntries(new FormData(event.target)));location.href=href('done',{receipt:saved.id});
    }
  }catch{notify('Nie udało się zapisać zmian. Projekt pozostaje w przeglądarce. Sprawdź pamięć witryny i spróbuj ponownie.');button.disabled=false;}finally{busy=false;}
});
async function updateQuantity(event){
  const key=event.target.dataset.quantity;if(!key)return;
  const p=cart.find(p=>p.id===key);if(!p||quantitySaving||Number(event.target.value)===p.quantity)return;
  if(!validQuantity(event.target.value)){event.target.value=p.quantity;notify('Wybierz nakład od 50 do 10 000 szt. Zachowano poprzednią wartość.');return;}
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
      const blob=new Blob([JSON.stringify({status:'prepared-locally',receipt:receipt.id,kind:receipt.kind,contact:receipt.contact||{},format,projects},null,2)],{type:'application/json'});
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
}catch{errorPage();}

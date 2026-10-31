const base=new URL('./',import.meta.url);
const href=path=>new URL(path,base).href;
const svg=body=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
const search=svg('<circle cx="10" cy="10" r="6.5"/><path d="m15 15 5 5"/>');
const headset=svg('<path d="M4 13v-2a8 8 0 0 1 16 0v6a4 4 0 0 1-4 4h-3"/><rect x="3" y="11" width="4" height="7" rx="2"/><rect x="17" y="11" width="4" height="7" rx="2"/>');
export function initClientFeedback(){
 if(document.querySelector('#client-feedback-css'))return;
 const css=document.createElement('link');css.id='client-feedback-css';css.rel='stylesheet';css.href=href('client-feedback.css?v=client-34');document.head.append(css);
 const header=document.querySelector('.site-nav');
 if(header){
  header.classList.add('shop-header');
  const form=document.createElement('form');form.className='shop-search';form.role='search';form.action=href('catalog/');
  form.innerHTML=`<label class="visually-hidden" for="shop-search">Szukaj produktów</label>${search}<input type="search" id="shop-search" name="q" placeholder="Szukaj torby, koloru, formatu…"><button aria-label="Szukaj" type="submit">Szukaj</button>`;
  header.querySelector('.ea-lockup')?.after(form);
  header.querySelector('.nav-actions a[aria-label="Szukaj produktów"]')?.remove();
  header.querySelectorAll('.shop-dropdown').forEach(el=>el.addEventListener('toggle',()=>{if(el.open)header.querySelectorAll('.shop-dropdown').forEach(other=>{if(other!==el)other.open=false;});}));
  document.addEventListener('click',e=>{if(!e.target.closest('.shop-dropdown'))header.querySelectorAll('.shop-dropdown').forEach(el=>el.open=false);});
  header.addEventListener('keydown',e=>{if(e.key==='Escape')header.querySelectorAll('.shop-dropdown[open]').forEach(el=>{el.open=false;el.querySelector('summary').focus();});});
 }
 const mobile=header?.querySelector('[data-action=menu]');if(mobile){mobile.removeAttribute('data-action');mobile.setAttribute('aria-controls','shop-navigation');mobile.setAttribute('aria-expanded','false');mobile.addEventListener('click',()=>{const open=header.classList.toggle('menu-expanded');mobile.setAttribute('aria-expanded',open);mobile.setAttribute('aria-label',open?'Zamknij menu':'Otwórz menu');});header.addEventListener('keydown',e=>{if(e.key==='Escape'&&header.classList.contains('menu-expanded')){header.classList.remove('menu-expanded');mobile.setAttribute('aria-expanded','false');mobile.setAttribute('aria-label','Otwórz menu');mobile.focus();}});}
 document.querySelectorAll('.ea-social a').forEach((a,i)=>{
  const names=['Facebook','Instagram','YouTube'];
  const shapes=['<path d="M14 21v-8h3l.5-4H14V7c0-1.5.5-2 2-2h2V1h-3c-4 0-6 2-6 6v2H6v4h3v8"/>','<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17 7h.01"/>','<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3Z"/>'];
  a.setAttribute('aria-label',names[i]+' — GRUPA EASOLUTION');a.title=names[i];a.innerHTML=svg(shapes[i]);
 });
 const topics=[
  ['product','Jak wybrać torbę?',`Zacznij od zastosowania, wymiarów i uchwytu. Do codziennych zakupów wybierz biały papier lub brązowy kraft z uchwytem płaskim albo skręcanym. W katalogu porównasz także modele materiałowe i opakowania dla gastronomii. <a href="${href('catalog/')}">Przejdź do katalogu</a>`],
  ['files','Jak przygotować plik do druku?',`W konfiguratorze wgrasz PNG, JPG lub SVG i ustawisz nadruk na widoku 2D. Użyj możliwie ostrego pliku, najlepiej z przezroczystym tłem. Finalny projekt i wymagania produkcyjne potwierdzamy przed drukiem. <a href="${href('how-to/#pliki')}">Przygotowanie plików</a>`],
  ['production','Kiedy rozpoczyna się produkcja?',`Po ustaleniu parametrów, dostępności bazy i zatwierdzeniu projektu do druku. Termin uzupełnienia brakującej bazy oraz termin nadruku ustalamy osobno. <a href="${href('contact/?topic=production')}">Zapytaj o produkcję</a>`],
  ['tracking','Śledzenie zamówienia',`Numer przesyłki znajdziesz w wiadomości potwierdzającej wysyłkę. Jeśli oczekujesz na realizację, podaj numer zamówienia w kontakcie z obsługą — sprawdzimy jego status. <a class="help-track" href="${href('contact/?topic=tracking')}">Zapytaj o status zamówienia</a>`],
  ['delivery','Dostawa i płatności',`Wysyłamy na terenie Polski. Sposób dostawy, jej koszt i termin otrzymasz w podsumowaniu oferty. <a href="${href('how-to/#dostawa')}">Informacje o dostawie</a>`],
  ['complaint','Reklamacja',`Przygotuj numer zamówienia, opis problemu i zdjęcia produktu. Skontaktuj się z obsługą, aby ustalić dalsze kroki. <a href="${href('contact/?topic=complaint')}">Kontakt w sprawie reklamacji</a>`]
 ];
 const help=document.createElement('div');help.className='shop-help';help.innerHTML=`<button type="button" class="help-launcher" aria-haspopup="dialog" aria-controls="shop-help-dialog" aria-expanded="false">${headset}<span>Pomoc</span></button><dialog id="shop-help-dialog" class="help-dialog" aria-labelledby="help-heading"><header><span>POMOC PRINTBAG24</span><h2 id="help-heading">W czym możemy pomóc?</h2><button type="button" class="help-close" aria-label="Zamknij pomoc">${svg('<path d="m6 6 12 12M18 6 6 18"/>')}</button></header><div class="help-body"><p>Wybierz temat. Najważniejsze odpowiedzi znajdziesz tutaj.</p>${topics.map(([id,title,text])=>`<details data-help-section="${id}"><summary>${title}</summary><p>${text}</p></details>`).join('')}<a class="help-contact" href="${href('contact/')}">Porozmawiaj z nami <span>17 230 54 10 · 600 090 253</span></a></div></dialog>`;document.body.append(help);
 const dialog=help.querySelector('dialog'),launcher=help.querySelector('.help-launcher');let previous;
 const open=topic=>{previous=document.activeElement;dialog.querySelectorAll('details').forEach(d=>d.open=d.dataset.helpSection===topic);if(!dialog.open)dialog.showModal();launcher.setAttribute('aria-expanded','true');dialog.querySelector('.help-close').focus();};
 launcher.addEventListener('click',()=>open());
 help.querySelector('.help-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 dialog.addEventListener('close',()=>{launcher.setAttribute('aria-expanded','false');previous?.focus();});
 document.querySelectorAll('[data-help-topic]').forEach(b=>b.addEventListener('click',()=>open(b.dataset.helpTopic)));
}

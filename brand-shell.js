const base=new URL('./',import.meta.url);
const link=path=>new URL(path,base).href;
const asset=name=>link('assets/'+name);
export const services=[
  ['Druk online','zamowdruk.pl','https://zamowdruk.pl/'],
  ['Druk DTF','printdtf24.pl','https://www.printdtf24.pl/'],
  ['Druk etykiet','etykieton24.pl','https://etykieton24.pl/'],
  ['Druk opakowań','printboxes24.pl','http://printboxes24.pl/'],
  ['Billboardy','wynajembilbordow.pl','https://www.wynajembilbordow.pl/']
];
const serviceLinks=()=>services.map(([label,name,url])=>`<a href="${url}" target="_blank" rel="noopener">${label} <span>· ${name}</span></a>`).join('');
export function groupBar(){return `<div class="ea-topbar"><div class="ea-topbar-inner"><nav class="ea-desktop-services" aria-label="Serwisy grupy EASOLUTION"><strong>Nasze serwisy:</strong>${serviceLinks()}</nav><details class="ea-mobile-services"><summary>Nasze serwisy</summary><nav aria-label="Pozostałe marki EASOLUTION">${serviceLinks()}</nav></details><div class="ea-phones"><span>Kontakt:</span><a href="tel:+48172305410">17 230 54 10</a><a href="tel:+48600090253">600 090 253</a></div></div></div>`;}
export function groupBrand(){return `<div class="ea-lockup"><a class="ea-group-logo" href="https://easolution.pl/" target="_blank" rel="noopener" aria-label="EA Solution Group"><img src="${asset('easolution-group-logo.png')}" alt="EA Solution Group" width="103" height="85"></a><span class="ea-plus" aria-hidden="true">+</span><a class="ea-print-logo" href="${link('glassy/')}" aria-label="Printbag24 — strona główna"><img src="${asset('printbag24-logo.png')}" alt="printbag24.pl" width="1774" height="887"></a></div>`;}
const external=(path,label)=>`<a href="https://zamowdruk.pl/${path}" target="_blank" rel="noopener" title="${label} — zamowdruk.pl">${label}</a>`;
export function groupFooter(){return `<footer class="ea-footer"><div class="ea-footer-grid"><div class="ea-company">${groupBrand()}<p>Torby z nadrukiem od GRUPY EASOLUTION.PL.<br>Produkujemy w Rzeszowie. Wysyłamy w całej Polsce.</p><address><strong>GRUPA EASOLUTION.PL</strong>al. Gen. Władysława Sikorskiego 140B<br>35-304 Rzeszów<br>NIP: 8132362514 · REGON: 180152629<br><a href="mailto:info@easolution.pl">info@easolution.pl</a></address><div class="ea-social"><span>Obserwuj nas</span><a href="https://www.facebook.com/zamowdrukpl/" target="_blank" rel="noopener">Facebook</a><a href="https://www.instagram.com/zamowdruk.pl/" target="_blank" rel="noopener">Instagram</a><a href="https://www.youtube.com/channel/UCZYdf_5aEOSOOzgLn7Gbe9Q" target="_blank" rel="noopener">YouTube</a></div></div><nav aria-label="O nas"><h2>O nas</h2><a href="${link('nasza-historia/')}">Nasza historia</a><a href="${link('contact/')}">Kontakt</a>${external('stopka-blog','Poradniki')}${external('program-lojalnosciowy','Program lojalnościowy')}</nav><nav aria-label="Pomoc"><h2>Pomoc</h2><a href="${link('how-to/')}">Jak zamawiać</a><a href="${link('how-to/#pliki')}">Przygotowanie plików</a><a href="${link('how-to/#dostawa')}">Dostawa i płatności</a><a href="${link('how-to/#faq')}">Najczęstsze pytania</a></nav><nav aria-label="Regulaminy grupy"><h2>Regulaminy</h2>${external('regulamin-sklepu','Regulamin drukarni')}${external('polityka-prywatnosci','Polityka prywatności')}${external('reklamacje-i-zwroty','Reklamacje i zwroty')}</nav></div><div class="ea-payments"><span>PŁATNOŚCI</span><div>${[['przelewy24','Przelewy24'],['blik','BLIK'],['visa','Visa'],['mastercard','Mastercard']].map(([name,label])=>`<img src="${asset('payment-'+name+'.png')}" alt="${label}" loading="lazy">`).join('')}</div></div><nav class="ea-footer-services" aria-label="Pozostałe serwisy grupy"><strong>Nasze serwisy:</strong>${serviceLinks()}</nav><div class="ea-copyright">© ${new Date().getFullYear()} printbag24.pl — Wszystkie prawa zastrzeżone.</div></footer>`;}
export function mountStandaloneShell(){
  const header=document.querySelector('.studio-header');
  if(header&&!document.querySelector('.ea-topbar')){
    header.insertAdjacentHTML('beforebegin',groupBar());
    header.querySelector('.studio-brand')?.insertAdjacentHTML('beforebegin',groupBrand());
    header.querySelector('.studio-brand')?.remove();
    const history=document.createElement('a');history.className='ea-header-history';history.href=link('nasza-historia/');history.textContent='Nasza historia';
    header.querySelector('.studio-header-label')?.replaceWith(history);
  }
  document.querySelector('.order-footer,.studio-footer')?.remove();
  if(!document.querySelector('.ea-footer'))document.body.insertAdjacentHTML('beforeend',groupFooter());
}
const timeline=[
  ['2000','Początek w Rzeszowie','Małe studio poligraficzne w garażu. Pierwsze pomysły, pierwsze projekty i początek własnej drogi.'],
  ['2001–2010','Pierwszy lokal, stali klienci','Przeprowadzka na ulicę Lwowską. Druk cyfrowy i introligatornia pozwalają samodzielnie wykańczać prace.'],
  ['2011–2015','Miejsce na rozwój','Większa siedziba i kolejne technologie przygotowują firmę do rozbudowy własnej produkcji.'],
  ['2016–2018','Własna siedziba','Powstaje zaplecze produkcyjno-biurowe. Rozwijamy druk rolowy i arkuszowy oraz park maszynowy.'],
  ['2019–2022','Marki z własną specjalizacją','Powstają etykieton24.pl i printboxes24.pl. Linia GM 330 Mini rozszerza możliwości wykańczania etykiet.'],
  ['2023','Więcej możliwości produkcji','Kolejne urządzenia Konica Minolta i Epson zwiększają elastyczność przy krótkich seriach i większych nakładach.'],
  ['2024','Biały druk i UV 3D','Maszyna UCJV300 otwiera nowe możliwości w etykietach i realizacjach specjalnych.'],
  ['2025','Detal, który czuć','MGI JETvarnish 3D One Gen2 rozwija lakierowanie wybiórcze, efekty przestrzenne, złocenie i srebrzenie.'],
  ['2026','Kolejny rozdział online','Rozwijamy printdtf24.pl, nowy sklep zamowdruk.pl i zadruk papierowych toreb. Printbag24 dołącza do wspólnej historii.']
];
export function historyPage(){return `<main class="ea-history-tree"><header class="ht-heading"><span class="eyebrow">NASZA HISTORIA / GRUPA EASOLUTION.PL</span><h1>Wszystko zaczęło się<br>od jednego pomysłu.</h1><p>Rzeszów, 2000 rok. Małe studio poligraficzne.<br>Dziś: własna produkcja i wyspecjalizowane marki.</p></header><section class="ht-experience" aria-label="Rozwój grupy EASOLUTION"><div class="ht-story"><span class="ht-period" id="ht-period">2000</span><div class="ht-copy" id="ht-copy"><h2>Początek w garażu.</h2><p>Małe studio poligraficzne w Rzeszowie. Pierwsze pomysły, pierwsze projekty i początek własnej drogi.</p></div><div class="ht-controls"><button type="button" id="ht-play">Zatrzymaj animację</button><span>Wybierz okres na osi.</span></div></div><div class="ht-tree" id="ht-tree" aria-label="Schemat marek grupy EASOLUTION"><svg viewBox="0 0 800 650" fill="none" aria-hidden="true"><g class="ht-growth" data-growth="0"><path pathLength="1" d="M400 110 V170"/></g><g class="ht-growth" data-growth="1"><path pathLength="1" d="M400 170 V230 M400 200 H218 Q200 200 200 218 V245 M400 200 H582 Q600 200 600 218 V245"/></g><g class="ht-growth" data-growth="2"><path pathLength="1" d="M400 230 V380 M400 350 H218 Q200 350 200 368 V395 M400 350 H582 Q600 350 600 368 V395"/></g><g class="ht-growth" data-growth="3"><path pathLength="1" d="M400 380 V500 M400 500 H218 Q200 500 200 518 V545 M400 500 H582 Q600 500 600 518 V545"/></g><g class="ht-growth ht-new-connection" data-growth="4"><path pathLength="1" d="M400 500 H582 Q600 500 600 518 V545"/></g></svg><div class="ht-origin"><img src="${asset('easolution-group-logo.png')}" alt="EA Solution Group" width="103" height="85"><span>Rzeszów · 2000</span></div>${[
['zamowdruk.pl','Druk online','https://zamowdruk.pl/',25,37.7,4],
['printbag24.pl','Torby z nadrukiem',link('glassy/'),75,83.85,4],
['etykieton24.pl','Etykiety','https://etykieton24.pl/',25,60.77,3],
['printboxes24.pl','Opakowania','http://printboxes24.pl/',75,60.77,3],
['printdtf24.pl','Druk DTF','https://www.printdtf24.pl/',25,83.85,4],
['wynajembilbordow.pl','Reklama zewnętrzna','https://www.wynajembilbordow.pl/',75,37.7,4]
].map(([name,label,href,x,y,stage])=>`<a class="ht-brand ${name==='printbag24.pl'?'ht-brand-current':''}" data-brand-stage="${stage}" style="--x:${x}%;--y:${y}%" href="${href}" ${name==='printbag24.pl'?'':'target="_blank" rel="noopener"'}><span>${label}</span><strong>${name}</strong></a>`).join('')}<span class="ht-tree-caption">Serwisy grupy EASOLUTION</span></div><nav class="ht-years" aria-label="Okres w historii firmy">${['2000','2001–2015','2016–2018','2019–2025','2026'].map((year,index)=>`<button type="button" data-history-stage="${index}" aria-pressed="${index===0}" aria-controls="ht-copy"><span>${year}</span></button>`).join('')}</nav></section><details class="ht-details"><summary>Daty i technologie — poznaj szczegóły</summary><div class="ea-history-timeline">${timeline.map(([year,title,copy])=>`<article><span>${year}</span><div><h2>${title}</h2><p>${copy}</p></div></article>`).join('')}</div></details><section class="ht-next"><span class="eyebrow">PRINTBAG24 / CZĘŚĆ GRUPY EASOLUTION</span><h2>Teraz pakujemy<br>Twoje pomysły.</h2><a class="button primary" href="${link('catalog/')}">Zobacz kolekcję toreb</a></section></main>`;}

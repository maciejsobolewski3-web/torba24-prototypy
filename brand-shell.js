import {accountButton,initAccountUI} from './account-ui.js?v=nav-17';
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
    header.insertAdjacentHTML('beforeend',accountButton());
  }
  document.querySelector('.order-footer,.studio-footer')?.remove();
  if(!document.querySelector('.ea-footer'))document.body.insertAdjacentHTML('beforeend',groupFooter());
  initAccountUI();
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
export function historyPage(){const calendar=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 3v4m8-4v4M4 10h16"/></svg>`;return `<main class="ea-history-page"><header class="history-heading"><span class="eyebrow">NASZA HISTORIA / GRUPA EASOLUTION.PL</span><h1>Od garażowego studia<br>do własnej produkcji.</h1><p>Poznaj kolejne etapy rozwoju EASOLUTION — grupy,<br>do której należy Printbag24.</p></header><section class="history-timeline" aria-label="Historia firmy od 2026 do 2000 roku"><div class="history-axis" aria-hidden="true"><span></span></div><ol>${[...timeline].reverse().map(([year,title,copy])=>`<li class="history-event"><div class="history-date"><span class="history-date-icon">${calendar}</span><span class="history-year">${year}</span></div><article class="history-card"><h2>${title}</h2><p>${copy}</p></article></li>`).join('')}</ol></section><section class="history-next"><img src="${asset('easolution-group-logo.png')}" alt="EA Solution Group" width="103" height="85"><span class="eyebrow">PRINTBAG24 / CZĘŚĆ GRUPY EASOLUTION</span><h2>Teraz pakujemy Twoje pomysły.</h2><a class="button primary" href="${link('catalog/')}">Zobacz kolekcję toreb</a></section></main>`;}

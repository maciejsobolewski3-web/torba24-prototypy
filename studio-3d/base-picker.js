import {catalogPriceLabel} from '../configuration/pricing.js?v=client-34';
import {enhanceOptions} from './option-picker.js?v=client-34';
import {catalog,escape as esc} from '../configuration/config.js?v=client-34';
import {catalogPhoto} from '../configuration/catalog-photos.js?v=client-34';
const normalize=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l').toLowerCase().replace(/×/g,'x').replace(/\s*x\s*/g,'x').replace(/(\d)\s+(g|cm)/g,'$1$2');
export function filterBases(products,{family='',query='',color=''}={}){
 const terms=normalize(query).trim().split(/\s+/).filter(Boolean);
 return products.filter(p=>(!family||(p.family===family||p.category===family))&&(!color||p.specs.Kolor===color||p.fields.find(f=>f.id==='stockColor')?.options.some(o=>o.label===color))&&terms.every(term=>normalize([p.name,p.size,...Object.values(p.specs),...p.fields.filter(f=>f.id==='size').flatMap(f=>f.options.map(o=>o.label))].join(' ')).includes(term)));
}
export function createBasePicker({getSelected,onChoose}){
 const dialog=document.createElement('dialog');dialog.className='base-picker';dialog.setAttribute('aria-labelledby','base-picker-title');
 dialog.innerHTML=`<header class="base-picker-header"><div><span class="studio-eyebrow">${catalog.products.length} BAZ · ROZMIARY I KOLORY</span><h2 id="base-picker-title">Wybierz swoją bazę.</h2><p>Zmień bazę. Twoje logo zostaje w projekcie.</p></div><button type="button" class="base-picker-close" aria-label="Zamknij wybór bazy">×</button></header><div class="base-picker-filters"><div class="base-family-tabs" role="group" aria-label="Rodzaj bazy"><button data-family="" aria-pressed="true">Wszystkie</button>${catalog.categories.map(f=>`<button data-family="${f.id}" aria-pressed="false">${esc(f.name)} <span>${catalog.products.filter(p=>p.category===f.id).length}</span></button>`).join('')}</div><div class="base-search-row"><label for="base-search">Szukaj modelu lub rozmiaru<input id="base-search" type="search" placeholder="Np. 38x42, płaski, skręcany…"></label><label for="base-color-filter">Kolor materiału<select id="base-color-filter"><option value="">Wszystkie kolory</option></select></label></div><p id="base-result-count" role="status" aria-live="polite"></p></div><div class="base-picker-grid" id="base-results"></div>`;
 document.body.append(dialog);let family='',query='',color='',opener;
 const $=s=>dialog.querySelector(s);
 function colors(){const all=catalog.products.filter(p=>!family||(p.family===family||p.category===family));const options=[...new Set(all.flatMap(p=>p.fields.find(f=>f.id==='stockColor')?.options.map(o=>o.label)||[p.specs.Kolor]).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pl'));if(!options.includes(color))color='';$('#base-color-filter').innerHTML='<option value="">Wszystkie kolory</option>'+options.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');$('#base-color-filter').value=color;enhanceOptions(dialog);}
 function render(){
  const products=filterBases(catalog.products,{family,query,color}),selected=getSelected();
  $('#base-result-count').textContent=`Dostępne modele: ${products.length} / ${catalog.products.length}`;
  $('#base-results').innerHTML=products.length?products.map(p=>{
   const formats=p.fields.find(f=>f.id==='size');const specs=[p.acceptsFormatRequest?'Format do ustalenia':formats?`${formats.options.length} ${formats.options.length===1?'format':formats.options.length<5?'formaty':'formatów'}`:p.size,p.specs.Gramatura,p.specs.Uchwyt==='brak'?'':p.specs.Uchwyt].filter(Boolean);
   return `<button type="button" class="base-card" data-base="${p.id}" aria-pressed="${selected===p.id}"><span class="base-card-photo"><img src="${catalogPhoto(p)}" alt="" width="480" height="480" loading="lazy">${selected===p.id?'<span class="base-selected">Wybrana baza</span>':''}</span><span class="base-card-name">${esc(p.name)}</span><span class="base-card-specs">${specs.map(esc).join(' · ')}</span><span class="base-card-price">${esc(catalogPriceLabel(p))}</span><span class="base-card-action">${selected===p.id?'Zostaw tę bazę':'Wybierz i dopasuj'}</span></button>`;
  }).join(''):'<div class="base-empty"><h3>Nie ma takiego połączenia.</h3><p>Zmień zapytanie lub usuń filtry.</p><button type="button" id="base-clear">Pokaż wszystkie modele</button></div>';
  dialog.querySelectorAll('[data-family]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.family===family)));
 }
 dialog.addEventListener('click',e=>{
  const choose=e.target.closest('[data-base]');if(choose){onChoose(choose.dataset.base);dialog.close();return;}
  const tab=e.target.closest('[data-family]');if(tab){family=tab.dataset.family;colors();render();return;}
  if(e.target.closest('.base-picker-close'))dialog.close();
  if(e.target.closest('#base-clear')){family=query=color='';$('#base-search').value='';colors();render();$('#base-search').focus();}
  if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}
 });
 $('#base-search').addEventListener('input',e=>{query=e.target.value;render();});$('#base-color-filter').addEventListener('change',e=>{color=e.target.value;render();});
 dialog.addEventListener('close',()=>{document.body.classList.remove('base-picker-open');opener?.focus({preventScroll:true});});
 return {open(button){opener=button;family=query=color='';$('#base-search').value='';colors();render();dialog.showModal();document.body.classList.add('base-picker-open');$('#base-search').focus({preventScroll:true});}};
}

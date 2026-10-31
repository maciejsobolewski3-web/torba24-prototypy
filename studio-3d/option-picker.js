import {escape as esc,colorHex} from '../configuration/config.js?v=client-34';
// Native selects retain their values and change events; the shop dialog supplies the visible UI.
let dialog,active,sourceId;
const fieldTitle=select=>[...(select.labels[0]?.childNodes||[])].filter(n=>n.nodeType===3).map(n=>n.textContent).join('').trim()||'Wybierz opcję';
export function enhanceOptions(root){
 if(!dialog){
  dialog=document.createElement('dialog');dialog.className='option-picker';dialog.setAttribute('aria-labelledby','option-picker-title');
  dialog.innerHTML='<header><div><span class="studio-eyebrow">DOPASUJ SWÓJ PRODUKT</span><h2 id="option-picker-title"></h2></div><button type="button" class="option-close" aria-label="Zamknij wybór">×</button></header><label class="option-search">Znajdź opcję<input type="search" id="option-query" placeholder="Wpisz nazwę lub rozmiar…"></label><div class="option-grid"></div>';
  document.body.append(dialog);
  dialog.querySelector('.option-close').onclick=()=>dialog.close();
  dialog.querySelector('#option-query').oninput=render;
  dialog.addEventListener('click',e=>{
   const item=e.target.closest('[data-value]');
   if(item){active.value=item.dataset.value;active.dispatchEvent(new Event('change',{bubbles:true}));enhanceOptions(document);dialog.close();}
   else if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}
  });
  dialog.addEventListener('close',()=>document.getElementById(sourceId+'-trigger')?.focus({preventScroll:true}));
  document.addEventListener('click',e=>{
   const button=e.target.closest('[data-option-select]');if(!button)return;
   active=document.getElementById(button.dataset.optionSelect);sourceId=active.id;
   dialog.querySelector('h2').textContent=fieldTitle(active);
   dialog.querySelector('#option-query').value='';dialog.querySelector('.option-search').hidden=active.options.length<9;
   render();dialog.showModal();dialog.querySelector('[aria-pressed="true"]')?.focus({preventScroll:true});
  });
 }
 root.querySelectorAll('.product-controls select,.base-picker select').forEach(select=>{
  select.hidden=true;let button=document.getElementById(select.id+'-trigger');
  if(!button){button=document.createElement('button');button.type='button';button.id=select.id+'-trigger';button.className='option-trigger';button.dataset.optionSelect=select.id;button.setAttribute('aria-haspopup','dialog');select.after(button);}
  const title=fieldTitle(select);
  const chosen=select.selectedOptions[0]?.textContent||'Wybierz';button.setAttribute('aria-label',title+': '+chosen);
  button.innerHTML=`<span>${esc(chosen)}</span><span class="option-change">Zmień</span>`;
 });
}
function render(){
 const query=dialog.querySelector('#option-query').value.toLocaleLowerCase('pl');
 const colors=/cord|ribbon|stockColor|color-filter/.test(active.id),options=[...active.options].filter(o=>!o.disabled&&o.text.toLocaleLowerCase('pl').includes(query));
 dialog.querySelector('.option-grid').innerHTML=options.length?options.map(o=>`<button type="button" data-value="${esc(o.value)}" aria-pressed="${o.value===active.value}">${colors&&o.value?`<i style="--swatch:${colorHex(o.text)}" aria-hidden="true"></i>`:''}<span>${esc(o.text)}</span><span class="option-tick" aria-hidden="true">✓</span></button>`).join(''):'<p>Brak wyników. Spróbuj innej nazwy.</p>';
}

import {enhanceOptions} from './option-picker.js?v=duplex-29';
import {createBasePicker} from './base-picker.js?v=duplex-29';
import {catalogPhoto} from '../configuration/catalog-photos.js?v=photos-24';
import {catalog,resolveProduct,defaults,valuesFrom,configuration,baseColor,activeFields,escape as esc} from '../configuration/config.js?v=duplex-29';
export function studioDefaults(product){
 const values=defaults(product),print=product.fields.find(f=>f.id==='printMode');
 if(print)values.printMode=(print.options.find(o=>o.label.includes('DTF'))||print.options.find(o=>o.label!=='bez nadruku')||print.options[0]).id;
 return values;
}
export function mountProductControls(studio){
 const root=document.querySelector('#product-controls');
 let config=studio.details().configuration,product=resolveProduct(config?.productId||'premium'),values={...defaults(product),...(config?valuesFrom(config):{})},requests=config?.requests||[];
 root.innerHTML=`<div class="current-base"><img id="current-base-photo" alt="" width="160" height="160"><div><span class="studio-eyebrow">WYBRANA BAZA</span><strong id="current-base-name"></strong><span id="studio-facts" class="model-facts"></span></div></div><button type="button" id="choose-base" class="choose-base-button" aria-haspopup="dialog">Zmień bazę <span>Wszystkie ${catalog.products.length} modeli</span></button><details class="product-details" open><summary>Format i wykończenie <span>Dobierz szczegóły</span></summary><div id="studio-options"></div></details><details class="product-details" id="studio-special"><summary>Opcje na zamówienie</summary><p>Te efekty i uchwyty potwierdzimy przy wycenie. Podgląd pokazuje standardową konstrukcję.</p><label for="request-finish">Efekt specjalny</label><select id="request-finish"><option value="">Bez dodatkowego efektu</option>${['Soft touch','Scuff free','Lakier UV wybiórczy','Hot stamping'].map(s=>`<option>${s}</option>`).join('')}</select><label for="request-handle">Inny uchwyt</label><select id="request-handle"><option value="">Uchwyt standardowy</option>${['Sznurek bawełniany','Tasiemka satynowa','Tasiemka rypsowa','Uchwyt wycinany'].map(s=>`<option>${s}</option>`).join('')}</select></details>`;
 const $=s=>root.querySelector(s);
 function render(){
  $('#current-base-photo').src=catalogPhoto(product);$('#current-base-name').textContent=product.name;
  $('#studio-facts').textContent=[product.fields.some(f=>f.id==='size')?studio.details().configuration?.dimensions.label:product.size,product.specs.Gramatura,product.specs.Uchwyt].filter(Boolean).join(' · ');
  $('#studio-options').innerHTML=activeFields(product,values).map(f=>`<label for="option-${f.id}">${esc(f.label)}</label><select id="option-${f.id}" data-option="${f.id}">${f.options.map(o=>`<option value="${esc(o.id)}" ${o.id===values[f.id]?'selected':''}>${esc(o.label)}</option>`).join('')}</select>`).join('');
  $('#studio-special').hidden=product.family!=='laminated';
  for(const type of ['finish','handle'])$('#request-'+type).value=requests.find(r=>r.type===type)?.value||'';
  enhanceOptions(root);
  document.querySelector('.panel-heading .studio-eyebrow').textContent=catalog.families.find(f=>f.id===product.family).name;
 }
 function apply(resetColor=false){
  studio.configure(configuration(product,values,resetColor?baseColor(product):studio.details().color.body,requests));render();
 }
 function choose(id){
  if(product.id===id)return;
  const previous=product,oldValues=values;product=resolveProduct(id);values=studioDefaults(product);
  if(previous.family===product.family)for(const f of product.fields)if(f.options.some(o=>o.id===oldValues[f.id]))values[f.id]=oldValues[f.id];
  requests=[];apply(true);const params=new URLSearchParams(location.search);params.set('sku',product.id);history.replaceState(null,'','?'+params);
  document.querySelector('#studio-status').textContent='Baza zmieniona. Logo i jego ustawienia pozostają w projekcie.';
 }
 document.addEventListener('studio-enable-back',()=>{
  const mode=product.fields.find(f=>f.id==='printMode');
  const both=mode?.options.find(o=>o.label.includes('różne'))||mode?.options.find(o=>o.label.includes('dwustronny'));
  if(both)values.printMode=both.id;
  else if(!requests.some(r=>r.type==='printSides'))requests.push({type:'printSides',value:'Nadruk dwustronny — do potwierdzenia przy wycenie'});
  apply();
 });
 const picker=createBasePicker({getSelected:()=>product.id,onChoose:choose});
 $('#choose-base').addEventListener('click',e=>picker.open(e.currentTarget));
 $('#studio-options').addEventListener('change',e=>{if(!e.target.dataset.option)return;const key=e.target.dataset.option;values[key]=e.target.value;apply();$('#option-'+key+'-trigger')?.focus();});
 for(const type of ['finish','handle'])$('#request-'+type).addEventListener('change',e=>{requests=requests.filter(r=>r.type!==type);if(e.target.value)requests.push({type,value:e.target.value});apply();});
 function showPanel(name){
  root.hidden=name!=='product';document.querySelector('#open-artwork').hidden=name!=='product';document.querySelector('#artwork-panel').hidden=name!=='artwork';
  document.querySelectorAll('[data-panel]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.panel===name)));
  document.querySelector('.studio-panel').scrollTop=0;
 }
 document.querySelectorAll('[data-panel]').forEach(b=>b.addEventListener('click',()=>showPanel(b.dataset.panel)));
 document.querySelector('#open-artwork').addEventListener('click',()=>showPanel('artwork'));
 render();
}

import {catalog,resolveProduct,defaults,valuesFrom,configuration,baseColor,activeFields,escape as esc} from '../configuration/config.js?v=catalog-22';
export function studioDefaults(product){
 const values=defaults(product),print=product.fields.find(f=>f.id==='printMode');
 if(print)values.printMode=(print.options.find(o=>o.label.includes('DTF'))||print.options.find(o=>o.label!=='bez nadruku')||print.options[0]).id;
 return values;
}
export function mountProductControls(studio){
 const root=document.querySelector('#product-controls');
 let config=studio.details().configuration,product=resolveProduct(config?.productId||'premium'),values={...defaults(product),...(config?valuesFrom(config):{})},requests=config?.requests||[];
 root.innerHTML=`<label for="studio-family">Rodzaj torby</label><select id="studio-family">${catalog.families.map(f=>`<option value="${f.id}">${esc(f.name)}</option>`).join('')}</select><label for="studio-product">Model</label><select id="studio-product"></select><div class="model-facts" id="studio-facts"></div><details class="product-details" open><summary>Format i wykończenie <span>Dobierz szczegóły</span></summary><div id="studio-options"></div></details><details class="product-details" id="studio-special"><summary>Opcje na zamówienie</summary><p>Te efekty i uchwyty potwierdzimy przy wycenie. Podgląd pokazuje standardową konstrukcję.</p><label for="request-finish">Efekt specjalny</label><select id="request-finish"><option value="">Bez dodatkowego efektu</option>${['Soft touch','Scuff free','Lakier UV wybiórczy','Hot stamping'].map(s=>`<option>${s}</option>`).join('')}</select><label for="request-handle">Inny uchwyt</label><select id="request-handle"><option value="">Uchwyt standardowy</option>${['Sznurek bawełniany','Tasiemka satynowa','Tasiemka rypsowa','Uchwyt wycinany'].map(s=>`<option>${s}</option>`).join('')}</select></details>`;
 const $=s=>root.querySelector(s);
 function render(){
  $('#studio-family').value=product.family;
  $('#studio-product').innerHTML=catalog.products.filter(p=>p.family===product.family).map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('');$('#studio-product').value=product.id;
  $('#studio-facts').textContent=[product.size,product.specs.Gramatura,product.specs.Uchwyt].filter(Boolean).join(' · ');
  $('#studio-options').innerHTML=activeFields(product,values).map(f=>`<label for="option-${f.id}">${esc(f.label)}</label><select id="option-${f.id}" data-option="${f.id}">${f.options.map(o=>`<option value="${esc(o.id)}" ${o.id===values[f.id]?'selected':''}>${esc(o.label)}</option>`).join('')}</select>`).join('');
  $('#studio-special').hidden=product.family!=='laminated';
  for(const type of ['finish','handle'])$('#request-'+type).value=requests.find(r=>r.type===type)?.value||'';
  document.querySelector('.panel-heading .studio-eyebrow').textContent=catalog.families.find(f=>f.id===product.family).name;
 }
 function apply(resetColor=false){
  studio.configure(configuration(product,values,resetColor?baseColor(product):studio.details().color.body,requests));render();
 }
 function choose(id){product=resolveProduct(id);values=studioDefaults(product);requests=[];apply(true);const params=new URLSearchParams(location.search);params.set('sku',product.id);history.replaceState(null,'','?'+params);}
 $('#studio-family').addEventListener('change',e=>choose(catalog.products.find(p=>p.family===e.target.value).id));
 $('#studio-product').addEventListener('change',e=>choose(e.target.value));
 $('#studio-options').addEventListener('change',e=>{if(!e.target.dataset.option)return;const key=e.target.dataset.option;values[key]=e.target.value;apply();$('#option-'+key)?.focus();});
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

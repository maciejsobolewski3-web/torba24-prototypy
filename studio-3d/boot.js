import {get} from '../order/store.js?v=catalog-22';
import {resolveProduct,defaults,configuration as makeConfiguration} from '../configuration/config.js?v=catalog-22';
import {mountStandaloneShell} from '../brand-shell.js?v=nav-17';
mountStandaloneShell();
const panel = document.querySelector('.studio-panel');
panel.classList.add('is-loading');
document.querySelector('.studio-layout').inert = true;
try {
  const params=new URLSearchParams(location.search);
  let configuration;
  if(params.has('project')){const saved=await get(params.get('from')==='cart'?'cart':'projects',params.get('project'));configuration=saved?.configuration;}
  else{const p=resolveProduct('premium'),values=defaults(p);const size=p.fields.find(f=>f.id==='size').options.find(o=>o.label==='24x9x26');if(size)values.size=size.id;configuration=makeConfiguration(p,values,'#164f3c');}
  const {initStudio} = await import('./scene.js?v=catalog-22');
  const studio = await initStudio(configuration);
  const {initOrderBridge} = await import('./order-bridge.js?v=catalog-22');
  await initOrderBridge(studio);
  panel.classList.remove('is-loading');
  document.querySelector('.studio-layout').inert = false;
} catch (error) {
  console.error('Studio 3D could not start:', error);
  document.querySelector('#scene').hidden = true;
  document.querySelector('.editor-tools').hidden = true;
  document.querySelector('.live-preview').hidden = true;
  document.querySelector('#stage-controls').hidden = true;
  document.querySelector('#scene-fallback').hidden = false;
  const fallbackParams=new URLSearchParams(location.search);
  const fallbackLink=document.querySelector('#scene-fallback a');
  if(!fallbackParams.has('project'))fallbackLink.href='../configuration/?id=premium';
  else{try{const saved=await get(fallbackParams.get('from')==='cart'?'cart':'projects',fallbackParams.get('project'));if(saved?.configuration)fallbackLink.href='../configuration/?'+fallbackParams;}catch{}}
  panel.classList.remove('is-loading');
  document.querySelector('.studio-layout').inert = false;
  panel.querySelectorAll('button,input').forEach(el => el.disabled = true);
  document.querySelector('#studio-status').textContent = 'Widok 3D jest niedostępny. Skorzystaj z klasycznego konfiguratora.';
}

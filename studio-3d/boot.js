import {get} from '../order/store.js?v=catalog-22';
import {resolveProduct,baseColor,configuration as makeConfiguration} from '../configuration/config.js?v=catalog-22';
import {mountProductControls,studioDefaults} from './product-controls.js?v=duplex-29';
import {mountStandaloneShell} from '../brand-shell.js?v=nav-27';
mountStandaloneShell();
const panel = document.querySelector('.studio-panel');
panel.classList.add('is-loading');
document.querySelector('.studio-layout').inert = true;
try {
  const params=new URLSearchParams(location.search);
  let configuration;
  if(params.has('project')){const saved=await get(params.get('from')==='cart'?'cart':'projects',params.get('project'));configuration=saved?.configuration;}
  else{const p=resolveProduct(params.get('sku')||params.get('id')||'premium');configuration=makeConfiguration(p,studioDefaults(p),baseColor(p));}
  const {initStudio} = await import('./scene.js?v=duplex-29');
  const studio = await initStudio(configuration);
  const {initOrderBridge} = await import('./order-bridge.js?v=flow-26');
  await initOrderBridge(studio);
  mountProductControls(studio);
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
  fallbackParams.set('fallback','1');fallbackLink.href='../configuration/?'+fallbackParams;
  panel.classList.remove('is-loading');
  document.querySelector('.studio-layout').inert = false;
  panel.querySelectorAll('button,input').forEach(el => el.disabled = true);
  document.querySelector('#studio-status').textContent = 'Widok 3D jest niedostępny. Skorzystaj z klasycznego konfiguratora.';
}

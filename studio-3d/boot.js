import {mountStandaloneShell} from '../brand-shell.js?v=nav-17';
mountStandaloneShell();
const panel = document.querySelector('.studio-panel');
panel.classList.add('is-loading');
document.querySelector('.studio-layout').inert = true;
try {
  const {initStudio} = await import('./scene.js?v=brand-7');
  const studio = await initStudio();
  const {initOrderBridge} = await import('./order-bridge.js?v=brand-7');
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
  panel.classList.remove('is-loading');
  document.querySelector('.studio-layout').inert = false;
  panel.querySelectorAll('button,input').forEach(el => el.disabled = true);
  document.querySelector('#studio-status').textContent = 'Widok 3D jest niedostępny. Skorzystaj z klasycznego konfiguratora.';
}

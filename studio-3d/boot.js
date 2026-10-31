const panel = document.querySelector('.studio-panel');
panel.classList.add('is-loading');
try {
  const {initStudio} = await import('./scene.js?v=dual-2');
  await initStudio();
  panel.classList.remove('is-loading');
} catch (error) {
  console.error('Studio 3D could not start:', error);
  document.querySelector('#scene').hidden = true;
  document.querySelector('#stage-controls').hidden = true;
  document.querySelector('#scene-fallback').hidden = false;
  panel.classList.remove('is-loading');
  panel.querySelectorAll('button,input').forEach(el => el.disabled = true);
  document.querySelector('#studio-status').textContent = 'Widok 3D jest niedostępny. Skorzystaj z klasycznego konfiguratora.';
}

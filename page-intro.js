(() => {
  const screen = document.querySelector('#page-intro');
  if (!screen) return;
  const started = performance.now();
  let finished = false;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(window.printbagIntroTimeout);
    document.documentElement.classList.remove('page-is-loading');
    screen.classList.add('is-ready');
    setTimeout(() => screen.remove(), reduced ? 0 : 380);
  }
  const decode = async image => {
    if (!image.complete) await new Promise(resolve => {
      image.addEventListener('load', resolve, {once:true});
      image.addEventListener('error', resolve, {once:true});
    });
    if (image.naturalWidth && image.decode) await image.decode().catch(() => {});
  };
  async function ready() {
    const order = document.querySelector('#order-main,#configuration-main');
    if (order && order.dataset.ready !== 'true') {
      let orderObserver;
      await Promise.race([
        new Promise(resolve => {
          orderObserver = new MutationObserver(() => {if (order.dataset.ready === 'true') resolve();});
          orderObserver.observe(order, {attributes:true,attributeFilter:['data-ready']});
        }),
        new Promise(resolve => setTimeout(resolve, 8000))
      ]);
      orderObserver?.disconnect();
    }
    const images = [...document.images].filter(image => {
      const rect = image.getBoundingClientRect();
      return image.closest('.hero,.site-nav,.studio-header,#page-intro') ||
        (rect.width && rect.height && rect.top < innerHeight && rect.bottom > 0);
    });
    // Only the opening view is blocking. Lazy images further down keep lazy loading.
    images.forEach(image => {image.loading = 'eager';});
    const studio = document.querySelector('.studio-layout');
    let observer;
    const studioReady = !studio?.inert ? Promise.resolve() : new Promise(resolve => {
      observer = new MutationObserver(() => {if (!studio.inert) {observer.disconnect();resolve();}});
      observer.observe(studio, {attributes:true,attributeFilter:['inert']});
    });
    await Promise.race([
      Promise.allSettled([...images.map(decode), document.fonts?.ready, studioReady]),
      new Promise(resolve => setTimeout(resolve, Math.max(0, 8000 - (performance.now() - started))))
    ]);
    observer?.disconnect();
    const minimum = reduced ? 0 : 450;
    setTimeout(finish, Math.max(0, minimum - (performance.now() - started)));
  }
  addEventListener('pageshow', event => {if (event.persisted) finish();});
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, {once:true});
  else ready();
})();

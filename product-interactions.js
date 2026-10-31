import { readLogo } from './logo-file.js';
const motion = () => !matchMedia('(prefers-reduced-motion: reduce)').matches;


export function heroUpload() {
  return `<div class="pb-hero-upload"><button type="button" class="button primary full" data-hero-upload><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6"/></svg><span data-upload-label>Zobacz swoje logo</span></button><input type="file" id="hero-logo-file" accept="image/png,image/jpeg,image/svg+xml" hidden><div class="pb-hero-file-actions" hidden><span data-hero-filename></span><button type="button" data-hero-remove aria-label="Usuń logo z podglądu">Usuń</button></div><p class="pb-upload-status" role="status">PNG, JPG lub SVG · do 5 MB<br> Plik pozostaje w Twojej przeglądarce.</p><button type="button" class="text-link" data-action="configure">Przejdź do studia</button></div>`;
}

export function initHeroUpload({openStudio, getSelection}) {
  const hero = document.querySelector('.glassy-hero');
  if (!hero) return;
  const input = hero.querySelector('#hero-logo-file');
  const upload = hero.querySelector('[data-hero-upload]');
  const status = hero.querySelector('.pb-upload-status');
  const prints = [...hero.querySelectorAll('.pb-demo-print')];
  const originals = prints.map(node => node.innerHTML);
  let logo = null, sequence = 0;
  const toggle = hero.querySelector('[data-action="preview-print"]');
  function reset() {
    sequence++;
    if (logo) URL.revokeObjectURL(logo.url);
    logo = null;
    prints.forEach((node, i) => {node.innerHTML = originals[i];});
    hero.classList.remove('has-own-logo', 'print-visible');
    hero.querySelector('.pb-hero-file-actions').hidden = true;
    hero.querySelector('[data-upload-label]').textContent = 'Zobacz swoje logo';
    hero.querySelector('[data-action="configure"]').innerHTML = `Przejdź do studia`;
    toggle.setAttribute('aria-pressed', 'false');
    toggle.textContent = 'Zobacz efekt nadruku';
    status.textContent = 'PNG, JPG lub SVG · do 5 MB. Plik pozostaje w Twojej przeglądarce.';
  }
  upload.addEventListener('click', () => input.click());
  hero.querySelector('[data-hero-remove]').addEventListener('click', reset);
  input.addEventListener('change', async () => {
    const file = input.files[0]; input.value = ''; if (!file) return;
    const current = ++sequence;
    status.textContent = 'Przygotowuję podgląd…';
    try {
      const next = await readLogo(file);
      if (current !== sequence || !hero.isConnected) {URL.revokeObjectURL(next.url); return;}
      if (logo) URL.revokeObjectURL(logo.url);
      logo = next;
      prints.forEach(node => {const img = document.createElement('img'); img.src = logo.url; img.alt = 'Podgląd Twojego logo na torbie'; node.replaceChildren(img);});
      hero.classList.add('has-own-logo', 'print-visible');
      hero.querySelector('[data-upload-label]').textContent = 'Zmień logo';
      hero.querySelector('.pb-hero-file-actions').hidden = false;
      hero.querySelector('[data-hero-filename]').textContent = logo.name;
      hero.querySelector('[data-action="configure"]').innerHTML = `Dopasuj nadruk w studiu`;
      toggle.setAttribute('aria-pressed', 'true'); toggle.textContent = 'Ukryj nadruk';
      status.textContent = 'Twoje logo jest na obu torbach. Porównaj papier i bawełnę.';
      if (innerWidth <= 950) hero.querySelector('.hero-products').scrollIntoView({behavior:motion()?'smooth':'auto',block:'center'});
      if (motion() && innerWidth > 950) {
        const selected = hero.querySelector(getSelection().material === 'cotton' ? '.cotton .pb-demo-print' : '.paper .pb-demo-print');
        const start = upload.getBoundingClientRect(), end = selected.getBoundingClientRect();
        const ghost = document.createElement('img'); ghost.src = next.url; ghost.alt = ''; ghost.className = 'pb-logo-flight';
        ghost.style.left = `${start.left + start.width / 2 - 28}px`; ghost.style.top = `${start.top + start.height / 2 - 28}px`;
        document.body.append(ghost);
        const flight = ghost.animate([
          {transform:'translate(0,0) scale(.75)', opacity:0},
          {transform:'translate(-15px,-30px) scale(1)', opacity:1, offset:.2},
          {transform:`translate(${end.left+end.width/2-start.left-start.width/2}px,${end.top+end.height/2-start.top-start.height/2}px) scale(.55)`,opacity:0}
        ], {duration:700, easing:'cubic-bezier(.23,1,.32,1)'});
        flight.finished.finally(() => ghost.remove());
        prints.forEach(node => node.animate([{opacity:0,scale:'.94'},{opacity:1,scale:'1'}], {duration:550,delay:180,easing:'cubic-bezier(.23,1,.32,1)',fill:'backwards'}));
      }
    } catch (error) {if (current === sequence) status.textContent = error.message;}
  });
  // Keep the file in memory while opening the editor; never persist its contents.
  hero.querySelector('[data-action="configure"]').addEventListener('click', event => {
    if (!logo) return;
    event.stopPropagation();
    openStudio(logo);
  });
}

export function initExampleReveals() {
  document.querySelectorAll('[data-example-reveal]').forEach(button => {
    let pinned = false;
    const title = button.dataset.exampleReveal;
    const show = value => {
      button.classList.toggle('is-revealed', value);
      button.setAttribute('aria-pressed', String(value));
      button.setAttribute('aria-label', `${value ? 'Ukryj' : 'Pokaż'} nadruk: ${title}`);
      button.querySelector('.pb-reveal-label').textContent = value ? 'Torba z charakterem' : 'Zobacz nadruk +';
    };
    button.addEventListener('pointerenter', event => {if (event.pointerType === 'mouse' && matchMedia('(hover:hover)').matches) show(true);});
    button.addEventListener('pointerleave', () => {if (!pinned) show(false);});
    button.addEventListener('click', () => {pinned = !pinned; show(pinned);});
  });
}

export function dimensions(product, spec) {
  const numbers = spec.size.replace(' cm','').split(' × ');
  const [width, height] = [numbers[0], numbers[numbers.length-1]];
  return `<div class="pb-size-guide" aria-hidden="true"><div class="pb-measure pb-measure-width"><span>${width} cm</span></div><div class="pb-measure pb-measure-height"><span>${height} cm</span></div>${product.material === 'paper' ? `<div class="pb-measure pb-measure-depth"><span>${numbers[1]} cm</span></div>` : ''}</div>`;
}
export function initDimensions() {
  const button = document.querySelector('[data-show-dimensions]');
  if (!button) return;
  const visual = button.closest('.pb-product-visual');
  button.addEventListener('click', () => {
    const active = visual.classList.toggle('show-dimensions');
    button.setAttribute('aria-pressed', String(active));
    button.textContent = active ? 'Ukryj wymiary' : 'Sprawdź rozmiar';
    visual.querySelector('.pb-size-note').textContent = active ? 'Wymiary przykładowe · schemat korpusu bez uchwytów' : 'Zobacz szerokość i wysokość korpusu torby.';
  });
}

const chapters = [
  ['2000', 'Początek w garażu.', 'Małe studio poligraficzne w Rzeszowie. Pierwsze pomysły, pierwsze projekty i początek własnej drogi.'],
  ['2001–2015', 'Pierwszy lokal. Nowe możliwości.', 'Lokal przy ulicy Lwowskiej, stali klienci, druk cyfrowy i introligatornia. Kolejna, większa siedziba daje miejsce na nowe technologie.'],
  ['2016–2018', 'Własne miejsce. Większa skala.', 'Powstaje siedziba z zapleczem produkcyjno-biurowym. Rozwijamy druk rolowy i arkuszowy oraz park maszynowy.'],
  ['2019–2025', 'Rosną nowe specjalizacje.', 'Dołączają etykieton24.pl i printboxes24.pl. Rozbudowujemy produkcję: od wykańczania etykiet po biały druk, lakier 3D, złocenie i srebrzenie.'],
  ['2026', 'Kolejny etap: Printbag24.', 'Rozwijamy druk DTF, zamowdruk.pl i zadruk papierowych toreb. Printbag24 łączy doświadczenie grupy z projektowaniem toreb online.']
];

export function initHistoryTree() {
  const section = document.querySelector('.ht-experience');
  if (!section) return;
  const tree = section.querySelector('#ht-tree');
  const period = section.querySelector('#ht-period');
  const copy = section.querySelector('#ht-copy');
  const control = section.querySelector('#ht-play');
  const years = [...section.querySelectorAll('[data-history-stage]')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let stage = reduce.matches ? 4 : 0;
  let playing = !reduce.matches;
  let visible = false;
  let elapsed = 0;
  let last = 0;
  let frame = 0;
  function paint() {
    const chapter = chapters[stage];
    period.textContent = chapter[0];
    copy.querySelector('h2').textContent = chapter[1];
    copy.querySelector('p').textContent = chapter[2];
    if (!reduce.matches) copy.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:350,easing:'ease-out'});
    tree.querySelectorAll('[data-growth]').forEach(group => group.classList.toggle('has-grown', Number(group.dataset.growth) <= stage));
    tree.querySelectorAll('[data-brand-stage]').forEach(brand => {
      const shown = Number(brand.dataset.brandStage) <= stage;
      brand.classList.toggle('has-grown', shown);
      brand.inert = !shown;
      brand.setAttribute('aria-hidden', String(!shown));
    });
    years.forEach((button, index) => {
      button.setAttribute('aria-pressed', String(index === stage));
      button.classList.toggle('is-past', index < stage);
    });
    control.textContent = playing ? 'Zatrzymaj animację' : stage === 4 ? 'Odtwórz ponownie' : 'Kontynuuj animację';
  }
  function tick(now) {
    frame = 0;
    if (!playing || !visible || document.hidden || reduce.matches) { last=0; return; }
    if (last) elapsed += Math.min(now - last, 100);
    last = now;
    if (elapsed >= 4000) {
      stage++;
      elapsed=0;
      if (stage === 4) playing=false;
      paint();
    }
    if (playing) frame=requestAnimationFrame(tick);
  }
  function sync() {
    if (frame) cancelAnimationFrame(frame);
    frame=0; last=0;
    if (playing && visible && !document.hidden && !reduce.matches) frame=requestAnimationFrame(tick);
  }
  years.forEach((button, index) => button.addEventListener('click', () => {
    stage=index; playing=false; elapsed=0; paint(); sync();
  }));
  control.addEventListener('click', () => {
    if (stage===4) {
      if (reduce.matches) return;
      stage=0; elapsed=0; playing=true;
    } else playing=!playing;
    paint(); sync();
  });
  reduce.addEventListener('change', () => {
    if (reduce.matches) {stage=4;playing=false;}
    control.hidden=reduce.matches;
    paint(); sync();
  });
  document.addEventListener('visibilitychange',sync);
  new IntersectionObserver(entries => {visible=entries[0].isIntersecting;sync();},{threshold:0.15}).observe(section);
  control.hidden=reduce.matches;
  // Let the initial SVG geometry paint before the first connection is drawn.
  requestAnimationFrame(() => requestAnimationFrame(paint));
}

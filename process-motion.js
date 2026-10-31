const base = new URL('./', import.meta.url);
const asset = name => new URL(`assets/${name}`, base).href;
const stages = [
  ['Wybierz bazę', 'Papier czy bawełna? Zacznij od torby, która pasuje do Twojego pomysłu.', 'Dobieramy materiał'],
  ['Dodaj swój znak', 'Logo trafia na torbę. Dopasuj wielkość i położenie nadruku w podglądzie.', 'Twoja marka na materiale'],
  ['Zatwierdź projekt', 'Sprawdź każdy detal. Finalny projekt do druku wymaga Twojej akceptacji.', 'Czas na akceptację'],
  ['Odbierz swoją serię', 'Z jednego pomysłu powstaje cała seria. Termin i dostawę ustalimy przy wycenie.', 'Gotowe na Twoją historię']
];
const check = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';
const bag = (cls='') => `<div class="pm-bag ${cls}"><div class="pm-bag-surface"><img src="${asset('cotton.webp')}" alt="" width="600" height="800" loading="lazy"><span class="pm-print">Twoja<br><em>marka.</em></span></div></div>`;

export function process(){return `<section class="section pm-section" id="jak-zamawiac" aria-labelledby="pm-heading">
  <div class="section-heading"><div><span class="eyebrow">ZOBACZ, JAK POWSTAJE TWÓJ PROJEKT</span><h2 id="pm-heading">Od pustej torby<br>do Twojej marki.</h2></div><a class="text-link" href="${new URL('catalog/',base).href}">Zacznij od swojej torby</a></div>
  <div class="pm-story" data-stage="0">
    <div class="pm-steps" role="group" aria-label="Etapy powstawania torby">${stages.map(([title,description],i)=>`<button type="button" class="pm-step ${i===0?'is-current':''}" data-stage-button="${i}" aria-pressed="${i===0}" aria-controls="pm-scene"><span class="pm-step-number">0${i+1}</span><span class="pm-step-copy"><strong>${title}</strong><span>${description}</span></span></button>`).join('')}<p class="pm-instruction">Wybierz etap, aby przyjrzeć się szczegółom. <button type="button" class="pm-resume" hidden>Wznów animację</button></p></div>
    <div class="pm-player">
      <div class="pm-scene" id="pm-scene" role="img" aria-label="${stages[0][1]}">
        <div class="pm-base-options" aria-hidden="true"><div class="pm-paper-option"><div class="pm-paper-product"><img src="${asset('paper.webp')}" alt="" width="600" height="800" loading="lazy"></div><span>Papier</span></div><span class="pm-cotton-label">${check} Bawełna</span><span class="pm-choice-click"></span><span class="pm-choice-pointer"><svg viewBox="0 0 32 40" fill="none"><path d="M3 2v29l8-7 6 13 6-3-6-12h12L3 2Z" fill="#fff" stroke="#174f3d" stroke-width="2.2" stroke-linejoin="round"/></svg></span></div>
        <div class="pm-series" aria-hidden="true">${bag('pm-copy pm-copy-left')}${bag('pm-copy pm-copy-right')}</div>
        <div class="pm-main" aria-hidden="true">${bag('pm-original')}<div class="pm-print-frame"><i></i><i></i><i></i><i></i><span>PODGLĄD NADRUKU</span></div></div>
        <div class="pm-file" aria-hidden="true"><span class="pm-file-icon">↥</span><div><strong>Twoje logo.svg</strong><span>Gotowe do podglądu</span></div><i>${check}</i></div>
        <div class="pm-proof" aria-hidden="true"><span class="pm-check">${check}</span><div><small>PROJEKT DO DRUKU</small><strong>Wszystko się zgadza.</strong><span>Akceptacja przed produkcją</span></div></div>
        <div class="pm-package" aria-hidden="true"><svg viewBox="0 0 260 220" fill="none"><path d="m25 72 104-50 105 49-105 53Z" fill="#e5dcc7"/><path d="m25 72 104 52v80L25 151Z" fill="#c9b48c"/><path d="m129 124 105-53v80l-105 53Z" fill="#b39b73"/><path d="m76 47 106 50 0 31-25 13v-31L51 60Z" fill="#f0eadb"/><path d="m25 72 104 52 105-53M129 124v80" stroke="#927f60" stroke-opacity=".4"/><path d="m160 157 11 5 17-24" stroke="#f4efe4" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Twoja seria.</span></div>
      </div>
    </div>
  </div>
  <div class="pm-footnote"><span>Twój pomysł. Nasze doświadczenie. Gotowa seria z Twoim znakiem.</span><a href="${new URL('how-to/#pliki',base).href}">Jak przygotować logo?</a></div>
</section>`;}

export function initProcessMotion(){
  const root=document.querySelector('.pm-story');
  if(!root)return;
  const buttons=[...root.querySelectorAll('[data-stage-button]')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const duration=2600;
  const resume=root.querySelector('.pm-resume');
  let stage=0,elapsed=0,last=0,frame=0,inView=false,playing=!reduced.matches;
  function selectionTime(){root.style.setProperty('--pm-selection-delay',`-${reduced.matches||!playing?duration:elapsed}ms`);}
  function paint(){
    selectionTime();
    root.dataset.stage=String(stage);
    root.dataset.motion=playing&&inView&&!document.hidden?'on':'off';
    resume.hidden=playing||reduced.matches;
    root.querySelector('.pm-scene').setAttribute('aria-label',stages[stage][1]);
    buttons.forEach((button,i)=>{button.classList.toggle('is-current',i===stage);button.setAttribute('aria-pressed',String(i===stage));});
  }
  function tick(time){
    frame=0;
    if(!playing||!inView||document.hidden)return;
    if(last)elapsed+=Math.min(time-last,100);
    last=time;
    if(elapsed>=duration){
      stage=(stage+1)%4;elapsed=0;paint();
    }
    if(stage===0)selectionTime();
    frame=requestAnimationFrame(tick);
  }
  function sync(){cancelAnimationFrame(frame);frame=0;last=0;paint();if(playing&&inView&&!document.hidden)frame=requestAnimationFrame(tick);}
  function select(index){stage=index;elapsed=0;playing=false;sync();}
  buttons.forEach((button,index)=>{
    button.addEventListener('click',()=>select(index));
    button.addEventListener('keydown',event=>{let next=index;if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(index+1)%4;else if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=(index+3)%4;else if(event.key==='Home')next=0;else if(event.key==='End')next=3;else return;event.preventDefault();buttons[next].focus();select(next);});
  });
  resume.addEventListener('click',()=>{playing=!reduced.matches;elapsed=0;sync();});
  // Observe the illustration, so tall mobile layouts can still start playback.
  const observer=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;sync();},{threshold:.25});
  observer.observe(root.querySelector('.pm-scene'));
  document.addEventListener('visibilitychange',sync);
  reduced.addEventListener('change',()=>{if(reduced.matches)playing=false;sync();});
  window.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);frame=0;last=0;});
  window.addEventListener('pageshow',sync);
  paint();
}

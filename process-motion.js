const base = new URL('./', import.meta.url);
const asset = name => new URL(`assets/${name}`, base).href;
const stages = [
  ['Wybierz bazę', 'Papier czy bawełna? Zacznij od torby, która pasuje do Twojego pomysłu.', 'Dobieramy materiał'],
  ['Dodaj swój znak', 'Logo trafia na torbę. Dopasuj wielkość i położenie nadruku w podglądzie.', 'Twoja marka na materiale'],
  ['Zatwierdź projekt', 'Sprawdź każdy detal. Finalny projekt do druku wymaga Twojej akceptacji.', 'Czas na akceptację'],
  ['Odbierz swoją serię', 'Z jednego pomysłu powstaje cała seria. Termin i dostawę ustalimy przy wycenie.', 'Gotowe na Twoją historię']
];
const check = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';
const bag = (cls='') => `<div class="pm-bag ${cls}"><img src="${asset('cotton.webp')}" alt="" width="600" height="800" loading="lazy"><span class="pm-print">Twoja<br><em>marka.</em></span></div>`;

export function process(){return `<section class="section pm-section" id="jak-zamawiac" aria-labelledby="pm-heading">
  <div class="section-heading"><div><span class="eyebrow">ZOBACZ, JAK POWSTAJE TWÓJ PROJEKT</span><h2 id="pm-heading">Od pustej torby<br>do Twojej marki.</h2></div><a class="text-link" href="${new URL('catalog/',base).href}">Zacznij od swojej torby</a></div>
  <div class="pm-story" data-stage="0">
    <div class="pm-steps" role="group" aria-label="Etapy powstawania torby">${stages.map(([title,description],i)=>`<button type="button" class="pm-step ${i===0?'is-current':''}" data-stage-button="${i}" aria-pressed="${i===0}" aria-controls="pm-scene"><span class="pm-step-number">0${i+1}</span><span class="pm-step-copy"><strong>${title}</strong><span>${description}</span></span></button>`).join('')}<p class="pm-instruction">Obejrzyj historię lub wybierz dowolny etap.</p></div>
    <div class="pm-player">
      <div class="pm-scene" id="pm-scene" role="img" aria-label="${stages[0][1]}">
        <div class="pm-studio-label" aria-hidden="true"><span><i></i> PRINTBAG24 / STUDIO</span><span class="pm-scene-counter">01 / 04</span></div>
        <div class="pm-orbit" aria-hidden="true"></div><div class="pm-floor" aria-hidden="true"></div>
        <div class="pm-materials" aria-hidden="true"><span class="pm-material-paper"><img src="${asset('paper.webp')}" alt="" width="80" height="100" loading="lazy">Papier</span><span class="pm-material-cotton">${check} Bawełna</span></div>
        <div class="pm-series" aria-hidden="true">${bag('pm-copy pm-copy-left')}${bag('pm-copy pm-copy-right')}</div>
        <div class="pm-main" aria-hidden="true">${bag('pm-original')}<div class="pm-print-frame"><i></i><i></i><i></i><i></i><span>PODGLĄD NADRUKU</span></div></div>
        <div class="pm-file" aria-hidden="true"><span class="pm-file-icon">↥</span><div><strong>Twoje logo.svg</strong><span>Gotowe do podglądu</span></div><i>${check}</i></div>
        <div class="pm-proof" aria-hidden="true"><span class="pm-check">${check}</span><div><small>PROJEKT DO DRUKU</small><strong>Wszystko się zgadza.</strong><span>Akceptacja przed produkcją</span></div></div>
        <div class="pm-package" aria-hidden="true"><svg viewBox="0 0 260 220" fill="none"><path d="m25 72 104-50 105 49-105 53Z" fill="#e5dcc7"/><path d="m25 72 104 52v80L25 151Z" fill="#c9b48c"/><path d="m129 124 105-53v80l-105 53Z" fill="#b39b73"/><path d="m76 47 106 50 0 31-25 13v-31L51 60Z" fill="#f0eadb"/><path d="m25 72 104 52 105-53M129 124v80" stroke="#927f60" stroke-opacity=".4"/><path d="m160 157 11 5 17-24" stroke="#f4efe4" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Twoja seria.</span></div>
        <div class="pm-caption" aria-hidden="true"><span class="pm-caption-line"></span><span class="pm-caption-text">${stages[0][2]}</span></div>
      </div>
      <div class="pm-player-controls"><button class="pm-play" type="button" aria-label="Wstrzymaj animację"><span class="pm-play-icon" aria-hidden="true">Ⅱ</span><span class="pm-play-label">Pauza</span></button><div class="pm-timeline" aria-hidden="true">${stages.map((_,i)=>`<span><i data-progress="${i}"></i></span>`).join('')}</div><span class="pm-duration">16 s</span></div>
    </div>
  </div>
  <div class="pm-footnote"><span>Twój pomysł. Nasze doświadczenie. Gotowa seria z Twoim znakiem.</span><a href="${new URL('how-to/#pliki',base).href}">Jak przygotować logo?</a></div>
</section>`;}

export function initProcessMotion(){
  const root=document.querySelector('.pm-story');
  if(!root)return;
  const buttons=[...root.querySelectorAll('[data-stage-button]')];
  const bars=[...root.querySelectorAll('[data-progress]')];
  const play=root.querySelector('.pm-play');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const duration=4000;
  let stage=0,elapsed=0,last=0,frame=0,inView=false,playing=!reduced.matches,complete=false;
  function paint(){
    root.dataset.stage=String(stage);
    root.querySelector('.pm-scene').setAttribute('aria-label',stages[stage][1]);
    root.querySelector('.pm-caption-text').textContent=stages[stage][2];
    root.querySelector('.pm-scene-counter').textContent=`0${stage+1} / 04`;
    buttons.forEach((button,i)=>{button.classList.toggle('is-current',i===stage);button.setAttribute('aria-pressed',String(i===stage));});
    bars.forEach((bar,i)=>bar.style.transform=`scaleX(${i<stage?1:i===stage?elapsed/duration:0})`);
    play.setAttribute('aria-label',complete?'Powtórz animację':playing?'Wstrzymaj animację':'Odtwórz animację');
    root.querySelector('.pm-play-label').textContent=complete?'Powtórz':playing?'Pauza':'Odtwórz';
    root.querySelector('.pm-play-icon').textContent=complete?'↻':playing?'Ⅱ':'▷';
  }
  function tick(time){
    frame=0;
    if(!playing||!inView||document.hidden)return;
    if(last)elapsed+=Math.min(time-last,100);
    last=time;
    if(elapsed>=duration){
      if(stage<3){stage++;elapsed=0;paint();}
      else{elapsed=duration;playing=false;complete=true;paint();return;}
    }
    bars[stage].style.transform=`scaleX(${elapsed/duration})`;
    frame=requestAnimationFrame(tick);
  }
  function sync(){cancelAnimationFrame(frame);frame=0;last=0;paint();if(playing&&inView&&!document.hidden)frame=requestAnimationFrame(tick);}
  function select(index){stage=index;elapsed=0;complete=false;playing=false;sync();}
  buttons.forEach((button,index)=>{
    button.addEventListener('click',()=>select(index));
    button.addEventListener('keydown',event=>{let next=index;if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(index+1)%4;else if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=(index+3)%4;else if(event.key==='Home')next=0;else if(event.key==='End')next=3;else return;event.preventDefault();buttons[next].focus();select(next);});
  });
  play.addEventListener('click',()=>{if(complete){stage=0;elapsed=0;complete=false;}playing=!playing;sync();});
  // Observe the illustration, so tall mobile layouts can still start playback.
  const observer=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;sync();},{threshold:.25});
  observer.observe(root.querySelector('.pm-scene'));
  document.addEventListener('visibilitychange',sync);
  reduced.addEventListener('change',()=>{if(reduced.matches)playing=false;sync();});
  window.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);frame=0;last=0;});
  window.addEventListener('pageshow',sync);
  paint();
}

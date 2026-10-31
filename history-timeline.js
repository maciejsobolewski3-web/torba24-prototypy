export function initHistoryTimeline() {
  const timeline = document.querySelector('.history-timeline');
  if (!timeline) return;
  const events = [...timeline.querySelectorAll('.history-event')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let furthest = 0;
  timeline.classList.add('is-enhanced');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, {threshold:0.08, rootMargin:'0px 0px -35px 0px'});
  events.forEach(event => observer.observe(event));
  function paint() {
    frame=0;
    const bounds=timeline.getBoundingClientRect();
    const reached=(innerHeight*.75-bounds.top)/Math.max(1,bounds.height-45);
    furthest=Math.max(furthest,Math.min(1,Math.max(0,reached)));
    timeline.style.setProperty('--line-progress',reduce.matches ? 1 : furthest);
    if (reduce.matches) events.forEach(event=>event.classList.add('is-visible'));
  }
  function schedule() { if (!frame) frame=requestAnimationFrame(paint); }
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule);
  reduce.addEventListener('change',schedule);
  schedule();
}

import * as THREE from 'three';
import {BAG,surfacePoint} from './model.js?v=merchant-33';

// DOM handles stay crisp at any pixel ratio; their coordinates follow the model UVs.
export function createEditOverlay({host,camera,getDraft,getSide,bounds,onChange,onCommit}){
  const layer=document.createElement('div');layer.className='edit-overlay';
  layer.innerHTML=`<svg class="print-guides" aria-hidden="true"><polygon class="safe-outline"/><line class="align-x"/><line class="align-y"/></svg><span class="safe-label">Pole nadruku</span><div class="print-selection" role="group" aria-label="Zaznaczony nadruk"><button class="print-move" aria-label="Przesuń nadruk. Użyj strzałek klawiatury."></button>${['nw','ne','sw','se'].map(c=>`<button class="resize-handle ${c}" data-corner="${c}" aria-label="Skaluj nadruk — narożnik ${c}. Użyj strzałek klawiatury."></button>`).join('')}<span class="selection-size"></span></div>`;
  host.append(layer);
  const selection=layer.querySelector('.print-selection'),svg=layer.querySelector('svg');
  let enabled=true,guides=true,gesture=null;
  function project(u,v){
    const sign=getSide()==='front'?1:-1;
    const point=new THREE.Vector3(...surfacePoint(u,v,sign===-1,.04)).project(camera);
    return {x:(point.x+1)/2*host.clientWidth,y:(1-point.y)/2*host.clientHeight};
  }
  function rect(b){const tl=project(b.x-b.w/2,b.y+b.h/2),br=project(b.x+b.w/2,b.y-b.h/2);return {x:tl.x,y:tl.y,w:br.x-tl.x,h:br.y-tl.y};}
  function line(selector,a,b,show){const el=layer.querySelector(selector);el.setAttribute('x1',a.x);el.setAttribute('y1',a.y);el.setAttribute('x2',b.x);el.setAttribute('y2',b.y);el.style.opacity=show?'1':'0';}
  function update(){
    layer.hidden=!enabled||!guides;if(layer.hidden)return;
    const pts=[[.14,.76],[.86,.76],[.86,.2],[.14,.2]].map(([u,v])=>project(u,v));
    svg.setAttribute('viewBox',`0 0 ${host.clientWidth} ${host.clientHeight}`);
    layer.querySelector('polygon').setAttribute('points',pts.map(p=>`${p.x},${p.y}`).join(' '));
    const label=layer.querySelector('.safe-label');label.style.left=pts[0].x+'px';label.style.top=(pts[0].y-26)+'px';
    const d=getDraft();selection.hidden=d.kind==='none';
    if(!selection.hidden){const r=rect(bounds(d));Object.assign(selection.style,{left:r.x+'px',top:r.y+'px',width:r.w+'px',height:r.h+'px'});layer.querySelector('.selection-size').textContent=Math.round(d.size)+'%';}
    line('.align-x',project(.5,.76),project(.5,.2),!!gesture&&Math.abs(d.x)<.5);
    line('.align-y',project(.14,.48),project(.86,.48),!!gesture&&Math.abs(d.y)<.5);
  }
  selection.addEventListener('pointerdown',event=>{
    if(event.button!==0)return;
    const d=getDraft(),b=bounds(d),r=rect(b),hr=host.getBoundingClientRect();
    const corner=event.target.dataset.corner;
    gesture={id:event.pointerId,corner,startX:event.clientX,startY:event.clientY,d:{...d},b,r,cx:hr.left+r.x+r.w/2,cy:hr.top+r.y+r.h/2};
    event.preventDefault();selection.setPointerCapture(event.pointerId);update();
  });
  selection.addEventListener('pointermove',event=>{
    if(!gesture||event.pointerId!==gesture.id)return;event.preventDefault();
    const g=gesture,d=getDraft();
    if(g.corner){
      const sx=g.corner.endsWith('e')?1:-1,sy=g.corner.startsWith('s')?1:-1;
      const dx=sx*(event.clientX-g.cx),dy=sy*(event.clientY-g.cy);
      // Project the drag onto the original diagonal to preserve the image aspect ratio.
      const ratio=(dx*g.r.w/2+dy*g.r.h/2)/(g.r.w*g.r.w/4+g.r.h*g.r.h/4);
      d.size=Math.round(THREE.MathUtils.clamp(g.d.size*ratio,20,68));
    }else{
      const du=(event.clientX-g.startX)/(g.r.w/g.b.w),dv=-(event.clientY-g.startY)/(g.r.h/g.b.h);
      d.x=THREE.MathUtils.clamp(g.d.x+du/Math.max(.005,(.72-g.b.w)/2)*100,-100,100);
      d.y=THREE.MathUtils.clamp(g.d.y+dv/Math.max(.005,(.56-g.b.h)/2)*100,-100,100);
      if(Math.abs(d.x)<5)d.x=0;if(Math.abs(d.y)<5)d.y=0;
    }
    onChange();update();
  });
  function finish(){if(!gesture)return;gesture=null;onCommit();update();}
  for(const event of ['pointerup','pointercancel','lostpointercapture'])selection.addEventListener(event,finish);
  selection.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
    event.preventDefault();const d=getDraft();
    if(event.target.dataset.corner)d.size=THREE.MathUtils.clamp(d.size+(['ArrowRight','ArrowUp'].includes(event.key)?2:-2),20,68);
    else{const axis=['ArrowLeft','ArrowRight'].includes(event.key)?'x':'y';d[axis]=THREE.MathUtils.clamp(d[axis]+(['ArrowRight','ArrowUp'].includes(event.key)?4:-4),-100,100);}
    onChange();onCommit();update();
  });
  return {update,setEnabled(value){enabled=value;finish();update();},setGuides(value){guides=value;finish();update();}};
}

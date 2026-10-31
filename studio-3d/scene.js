import * as THREE from 'three';
import {OrbitControls} from '../vendor/three/OrbitControls.js';
import {RoomEnvironment} from '../vendor/three/RoomEnvironment.js';
import {createEditOverlay} from './edit-overlay.js?v=workbench-4';
import {createLivePreview} from './live-preview.js?v=workbench-4';
import {readLogo} from '../logo-file.js';
import {BAG,palette,createBag} from './model.js?v=1';

export async function initStudio(){
  const $=selector=>document.querySelector(selector),host=$('#scene'),status=$('#studio-status');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setClearColor(0x000000,0);
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
  const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Torba papierowa 3D. Przeciągnij, aby obrócić. Użyj przycisków Przód, Tył i Detal, aby zmienić widok.');host.append(canvas);
  const scene=new THREE.Scene(),perspectiveCamera=new THREE.PerspectiveCamera(34,1,.1,60);
  const flatCamera=new THREE.OrthographicCamera(-2.5,2.5,2.5,-2.5,.1,60);
  let camera=perspectiveCamera;
  camera.position.set(5.3,3.3,7.5);
  const controls=new OrbitControls(camera,canvas);controls.target.set(0,1.95,0);controls.enablePan=false;controls.enableDamping=true;controls.dampingFactor=.09;controls.minDistance=4.2;controls.maxDistance=13;controls.minPolarAngle=.4;controls.maxPolarAngle=Math.PI*.72;controls.autoRotateSpeed=.65;controls.update();
  // Keep ordinary one-finger page scrolling on phones; two fingers orbit/zoom.
  controls.touches.ONE=innerWidth<=760?null:THREE.TOUCH.ROTATE;controls.touches.TWO=THREE.TOUCH.DOLLY_ROTATE;
  canvas.style.touchAction=innerWidth<=760?'pan-y':'none';
  const environment=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer),env=pmrem.fromScene(environment,.05);
  scene.environment=env.texture;scene.environmentIntensity=.55;environment.dispose();pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xffffff,0x84967a,.85));
  const key=new THREE.DirectionalLight(0xfff8e9,2.2);key.position.set(-3,7,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-4;key.shadow.camera.right=4;key.shadow.camera.top=5;key.shadow.camera.bottom=-4;key.shadow.normalBias=.035;key.shadow.bias=-.0001;key.shadow.radius=4;scene.add(key);
  const fill=new THREE.DirectionalLight(0xe5f5f1,.7);fill.position.set(4,4,-5);scene.add(fill);
  const bag=createBag();scene.add(bag.group);
  // A baked contact shadow anchors the bag without an expensive post-processing pass.
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;const sc=shadowCanvas.getContext('2d'),gradient=sc.createRadialGradient(64,64,8,64,64,64);gradient.addColorStop(0,'rgba(26,50,31,.22)');gradient.addColorStop(1,'rgba(26,50,31,0)');sc.fillStyle=gradient;sc.fillRect(0,0,128,128);
  const contact=new THREE.Mesh(new THREE.PlaneGeometry(4.8,2.7),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));contact.rotation.x=-Math.PI/2;contact.position.y=.035;scene.add(contact);
  let mode='2d',color='green',side='front',frame=0,tween=null,lastTime=0,drag=null,disposed=false;
  const drafts={front:{kind:'example',image:null,url:null,name:'Twoja marka.',size:48,x:0,y:0,sequence:0},back:{kind:'none',image:null,url:null,name:'',size:48,x:0,y:0,sequence:0}};
  let overlay=null,preview=null;
  const wide=matchMedia('(min-width: 1100px)');
  const textures={};
  for(const s of ['front','back']){const c=document.createElement('canvas');c.width=1024;c.height=1024;textures[s]={canvas:c,texture:new THREE.CanvasTexture(c)};textures[s].texture.colorSpace=THREE.SRGBColorSpace;textures[s].texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());bag.printMeshes[s].material.map=textures[s].texture;}
  // Printing is constrained to an illustrative safe rectangle, not the entire mesh.
  function bounds(d){
    const width=d.size/100;
    const aspect=d.image?d.image.naturalWidth/d.image.naturalHeight:1.45;
    let height=width*BAG.width/BAG.height/aspect;
    let w=width;
    if(height>.5){w*=.5/height;height=.5;}
    const x=.5+(d.x/100)*(.72-w)/2;
    const y=.48+(d.y/100)*(.56-height)/2;
    return {x,y,w,h:height};
  }
  function draw(s){const d=drafts[s],c=textures[s].canvas,ctx=c.getContext('2d');ctx.clearRect(0,0,1024,1024);
    if(d.kind!=='none'){
      const b=bounds(d),x=(b.x-b.w/2)*1024,y=(1-b.y-b.h/2)*1024,w=b.w*1024,h=b.h*1024;
      if(d.image)ctx.drawImage(d.image,x,y,w,h);
      else{ctx.fillStyle=palette[color].ink;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`500 ${h*.47}px Georgia,serif`;ctx.fillText('Twoja',x+w/2,y+h*.29,w);ctx.font=`italic 500 ${h*.47}px Georgia,serif`;ctx.fillText('marka.',x+w/2,y+h*.78,w);}
    }
    textures[s].texture.needsUpdate=true;bag.printMeshes[s].visible=d.kind!=='none';overlay?.update();invalidate();
  }
  function syncPanel(){const d=drafts[side];$('#copy-print').disabled=d.kind==='none';$('#copy-print').textContent=side==='front'?'Skopiuj nadruk na tył':'Skopiuj nadruk na przód';$('#side-label').textContent=side==='front'?'Przód':'Tył';document.querySelectorAll('[data-side]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.side===side)));$('#logo-kind').textContent=d.kind==='example'?'Przykładowy nadruk':d.kind==='image'?'Twoje logo':'Bez nadruku';$('#upload-label').textContent=d.kind==='image'?'Zmień logo':'Wgraj swoje logo';$('#file-name').textContent=d.name;$('#logo-actions').hidden=d.kind==='none';$('#example').hidden=d.kind!=='none';$('#logo-settings').hidden=d.kind==='none';$('#logo-size').value=d.size;$('#size-value').value=d.size+'%';$('#logo-x').value=d.x;$('#logo-y').value=d.y;}
  function setRotation(value){value=value&&mode==='3d';controls.autoRotate=value;$('#rotate').setAttribute('aria-pressed',String(value));$('#rotate').textContent=value?'Zatrzymaj':'Obrót 360°';invalidate();}
  const views={front:{position:[0,2.2,9],target:[0,1.95,0]},back:{position:[0,2.2,-9],target:[0,1.95,0]},detail:{position:[3.2,4.25,4.4],target:[0,2.45,0]},perspective:{position:[5.3,3.3,7.5],target:[0,1.95,0]}};
  function goView(name){setRotation(false);if(mode==='2d'){alignFlatView();invalidate();return;}const view=views[name];document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===name)));const to=new THREE.Vector3(...view.position),target=new THREE.Vector3(...view.target);
    if(reduced.matches){camera.position.copy(to);controls.target.copy(target);controls.update();tween=null;}else{
      // Spherical interpolation keeps the camera outside the bag while changing sides.
      const fromS=new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));const toS=new THREE.Spherical().setFromVector3(to.clone().sub(target));let delta=toS.theta-fromS.theta;while(delta>Math.PI)delta-=Math.PI*2;while(delta<-Math.PI)delta+=Math.PI*2;toS.theta=fromS.theta+delta;
      tween={start:performance.now(),from:fromS,to:toS,targetFrom:controls.target.clone(),targetTo:target};
    }invalidate();
  }
  function selectSide(s){side=s;syncPanel();goView(s);preview?.orient(s);overlay?.update();status.textContent=s==='front'?'Edytujesz przód torby.':'Edytujesz tył torby. Nadruki obu stron ustawiasz osobno.';}
  function tick(now){frame=0;if(disposed||document.hidden||!stageVisible())return;const dt=Math.min((now-lastTime)/1000||.016,.05);lastTime=now;
    if(tween){const t=Math.min(1,(now-tween.start)/700),e=1-Math.pow(1-t,3);controls.target.lerpVectors(tween.targetFrom,tween.targetTo,e);const s=new THREE.Spherical(THREE.MathUtils.lerp(tween.from.radius,tween.to.radius,e),THREE.MathUtils.lerp(tween.from.phi,tween.to.phi,e),THREE.MathUtils.lerp(tween.from.theta,tween.to.theta,e));camera.position.setFromSpherical(s).add(controls.target);if(t===1)tween=null;}
    const moving=mode==='3d'&&controls.update(dt);renderer.render(scene,camera);overlay?.update();const previewMoving=preview?.render(dt);if(tween||controls.autoRotate||moving||previewMoving)invalidate();
  }
  // Check the actual stage bounds: observing an absolutely positioned canvas in a
  // clipped sticky container can report a stale intersection after resizing.
  function stageVisible(){const r=$('.studio-stage').getBoundingClientRect();return r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth;}
  function invalidate(){if(!frame&&!disposed&&!document.hidden)frame=requestAnimationFrame(tick);}
  controls.addEventListener('change',invalidate);controls.addEventListener('start',()=>{tween=null;setRotation(false);document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed','false'));});
  // Both projections render the same model and print textures. In 2D the camera is
  // exactly perpendicular to the face: no perspective, side wall or orbit drift.
  function alignFlatView(){
    flatCamera.position.set(0,2.02,side==='front'?9:-9);
    flatCamera.lookAt(0,2.02,0);flatCamera.updateMatrixWorld();
    document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===side)));
  }
  function updateHints(){
    const mobile=innerWidth<=760;
    canvas.style.touchAction=mobile?'pan-y':'none';
    controls.touches.ONE=mobile?null:THREE.TOUCH.ROTATE;
    $('.drag-tip').textContent=mode==='2d'?'Przeciągnij logo lub narożnik ramki. Możesz też użyć suwaków.':mobile?'Dopasuj położenie nadruku suwakami powyżej.':'Możesz też przeciągnąć nadruk bezpośrednio na torbie.';
    $('#scene-hint').textContent=mode==='2d'?(wide.matches?'Edytuj na wprost · podgląd 3D zmienia się na żywo':'Widok na wprost · ustaw logo i sprawdź efekt w 3D'):mobile?'Dwoma palcami obróć i przybliż · lub wybierz widok poniżej':'Przeciągnij, aby obrócić · przybliż kółkiem lub dwoma palcami';
    canvas.setAttribute('aria-label',mode==='2d'?'Torba papierowa 2D, widok dokładnie na wprost. Strzałkami ustaw położenie nadruku.':'Torba papierowa 3D. Przeciągnij, aby obrócić. Strzałkami w lewo i w prawo obrócisz torbę.');
  }
  function setMode(next){
    setRotation(false);tween=null;drag=null;mode=next;
    controls.enabled=mode==='3d';camera=mode==='2d'?flatCamera:perspectiveCamera;
    contact.visible=mode==='3d';
    $('.studio-stage').dataset.mode=mode;
    $('.studio-stage').setAttribute('aria-label',`Podgląd torby w ${mode.toUpperCase()}`);
    $('#mode-label').textContent=mode==='2d'?'Projektuj na wprost':'Obejrzyj w przestrzeni';
    document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
    document.querySelectorAll('[data-only-3d]').forEach(el=>el.hidden=mode==='2d');
    if(mode==='2d')alignFlatView();
    else {
      // Start on the edited side; flush residual orbit damping before positioning.
      controls.enableDamping=false;controls.update();controls.enableDamping=true;
      camera.position.set(5.3,3.3,side==='front'?7.5:-7.5);controls.target.set(0,1.95,0);controls.update();
      document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed','false'));
    }
    syncWorkspace();updateHints();invalidate();
  }
  document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{
    if(b.dataset.mode===mode)return;setMode(b.dataset.mode);
    status.textContent=mode==='2d'?'Widok 2D na wprost. Logo i ustawienia pozostają wspólne z 3D.':'Widok 3D. Oglądasz ten sam projekt, który ustawiasz w 2D.';
  }));
  function syncWorkspace(){
    const split=wide.matches&&mode==='2d';
    $('.studio-stage').classList.toggle('is-split',split);
    $('.live-preview').hidden=!split;
    $('.editor-tools').hidden=mode!=='2d';
    if(split&&!preview){try{preview=createLivePreview({host:$('#live-scene'),scene,contact,invalidate,onExpand:()=>setMode('3d')});preview.orient(side);}catch(error){console.warn('Live preview unavailable',error);$('.live-preview').hidden=true;$('.studio-stage').classList.remove('is-split');}}
    if(preview?.failed){$('.live-preview').hidden=true;$('.studio-stage').classList.remove('is-split');}
    preview?.setActive(split);overlay?.setEnabled(mode==='2d');
  }
  wide.addEventListener('change',()=>{syncWorkspace();updateHints();invalidate();});
  const resize=new ResizeObserver(()=>{const r=host.getBoundingClientRect();if(!r.width||!r.height)return;
    const aspect=r.width/r.height;perspectiveCamera.aspect=aspect;perspectiveCamera.updateProjectionMatrix();
    const height=Math.max(4.65,3.75/aspect),width=height*aspect;
    flatCamera.left=-width/2;flatCamera.right=width/2;flatCamera.top=height/2;flatCamera.bottom=-height/2;flatCamera.updateProjectionMatrix();
    renderer.setSize(r.width,r.height);overlay?.update();updateHints();invalidate();
  });resize.observe(host);
  window.addEventListener('scroll',invalidate,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else invalidate();});
  reduced.addEventListener('change',()=>{if(reduced.matches){tween=null;setRotation(false);}invalidate();});
  document.querySelectorAll('[data-color]').forEach(b=>b.addEventListener('click',()=>{color=b.dataset.color;bag.setColor(color);$('#color-label').textContent=palette[color].name;document.querySelectorAll('[data-color]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));draw('front');draw('back');}));
  document.querySelectorAll('[data-side]').forEach(b=>b.addEventListener('click',()=>selectSide(b.dataset.side)));
  document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{if(['front','back'].includes(b.dataset.view))selectSide(b.dataset.view);else goView(b.dataset.view);}));
  $('#rotate').addEventListener('click',()=>{tween=null;setRotation(!controls.autoRotate);});
  $('#upload').addEventListener('click',()=>$('#logo-file').click());
  $('#logo-file').addEventListener('change',async event=>{const file=event.target.files[0];event.target.value='';if(!file)return;const selected=side,d=drafts[selected],sequence=++d.sequence;status.textContent='Przygotowuję logo…';
    try{const next=await readLogo(file),img=new Image();img.src=next.url;await img.decode();if(sequence!==d.sequence||disposed){URL.revokeObjectURL(next.url);return;}if(d.url)URL.revokeObjectURL(d.url);Object.assign(d,{kind:'image',image:img,url:next.url,name:next.name,x:0,y:0});draw(selected);syncPanel();status.textContent=`Logo dodane na ${selected==='front'?'przód':'tył'} torby.`;}catch(error){if(sequence===d.sequence)status.textContent=error.message;}
  });
  $('#remove-logo').addEventListener('click',()=>{const d=drafts[side];d.sequence++;if(d.url)URL.revokeObjectURL(d.url);Object.assign(d,{kind:'none',image:null,url:null,name:''});draw(side);syncPanel();status.textContent='Nadruk usunięty z wybranej strony.';});
  $('#example').addEventListener('click',()=>{Object.assign(drafts[side],{kind:'example',name:'Twoja marka.',x:0,y:0,size:48});draw(side);syncPanel();});
  for(const [id,key] of [['logo-size','size'],['logo-x','x'],['logo-y','y']])$('#'+id).addEventListener('input',event=>{drafts[side][key]=Number(event.target.value);$('#size-value').value=drafts[side].size+'%';draw(side);});
  $('#copy-print').addEventListener('click',async()=>{
    const source={...drafts[side]},target=side==='front'?'back':'front',d=drafts[target];
    if(source.kind==='none')return;const sequence=++d.sequence;
    // Each side owns its object URL so removing one print cannot break the other.
    let url=null;
    try{if(source.url)url=URL.createObjectURL(await (await fetch(source.url)).blob());
      if(d.sequence!==sequence||disposed){if(url)URL.revokeObjectURL(url);return;}
      if(d.url)URL.revokeObjectURL(d.url);Object.assign(d,source,{url,sequence});draw(target);
      status.textContent=`Nadruk skopiowany na ${target==='back'?'tył':'przód'}. Możesz edytować obie strony osobno.`;
    }catch{if(url)URL.revokeObjectURL(url);status.textContent='Nie udało się skopiować nadruku. Spróbuj ponownie.';}
  });
  $('#center-logo').addEventListener('click',()=>{drafts[side].x=drafts[side].y=0;syncPanel();draw(side);});
  // Drag a print in UV space. The sliders remain a keyboard/touch alternative.
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
  function hit(event){const r=canvas.getBoundingClientRect();pointer.set((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);return ray.intersectObjects(Object.values(bag.printMeshes).filter(m=>m.visible))[0];}
  canvas.addEventListener('pointerdown',event=>{if(event.pointerType==='touch'||event.button!==0)return;const h=hit(event);if(!h)return;const s=h.object.userData.side,d=drafts[s],b=bounds(d);if(Math.abs(h.uv.x-b.x)>b.w/2||Math.abs(h.uv.y-b.y)>b.h/2)return;event.stopImmediatePropagation();event.preventDefault();setRotation(false);tween=null;side=s;syncPanel();drag={pointer:event.pointerId,side:s,offsetX:h.uv.x-b.x,offsetY:h.uv.y-b.y};controls.enabled=false;canvas.setPointerCapture(event.pointerId);},true);
  canvas.addEventListener('pointermove',event=>{if(!drag||event.pointerId!==drag.pointer)return;const h=hit(event);if(!h||h.object.userData.side!==drag.side)return;const d=drafts[drag.side],b=bounds(d);d.x=THREE.MathUtils.clamp((h.uv.x-drag.offsetX-.5)/Math.max(.005,(.72-b.w)/2)*100,-100,100);d.y=THREE.MathUtils.clamp((h.uv.y-drag.offsetY-.48)/Math.max(.005,(.56-b.h)/2)*100,-100,100);syncPanel();draw(drag.side);});
  const endDrag=()=>{drag=null;controls.enabled=mode==='3d';};canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);canvas.addEventListener('lostpointercapture',endDrag);
  canvas.addEventListener('keydown',event=>{
    if(mode==='2d'){
      const changes={ArrowLeft:['x',-4],ArrowRight:['x',4],ArrowUp:['y',4],ArrowDown:['y',-4]};
      const change=changes[event.key];if(!change||drafts[side].kind==='none')return;
      event.preventDefault();const [axis,amount]=change;drafts[side][axis]=THREE.MathUtils.clamp(drafts[side][axis]+amount,-100,100);syncPanel();draw(side);return;
    }
    if(!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();setRotation(false);tween=null;const offset=camera.position.clone().sub(controls.target);offset.applyAxisAngle(new THREE.Vector3(0,1,0),event.key==='ArrowLeft'?-.16:.16);camera.position.copy(controls.target).add(offset);controls.update();invalidate();});
  $('#save-preview').addEventListener('click',()=>{renderer.render(scene,camera);const output=document.createElement('canvas');output.width=canvas.width;output.height=canvas.height;const ctx=output.getContext('2d');ctx.fillStyle='#e7eee3';ctx.fillRect(0,0,output.width,output.height);ctx.drawImage(canvas,0,0);ctx.fillStyle='#456453';ctx.font=`${Math.max(12,output.width*.014)}px sans-serif`;ctx.fillText('PRINTBAG24 / PODGLĄD POGLĄDOWY',output.width*.04,output.height*.96);output.toBlob(blob=>{if(!blob){status.textContent='Nie udało się zapisać podglądu.';return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`printbag24-podglad-${mode}-${side==='front'?'przod':'tyl'}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='Podgląd PNG został przygotowany do pobrania.';},'image/png');});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();setRotation(false);$('#scene-fallback').hidden=false;$('.editor-tools').hidden=true;$('.live-preview').hidden=true;preview?.setActive(false);$('#stage-controls').hidden=true;$('#scene').hidden=true;$('#fallback-message').textContent='Widok 3D został zatrzymany. Odśwież stronę lub otwórz podgląd klasyczny.';document.querySelectorAll('.studio-panel button,.studio-panel input').forEach(el=>el.disabled=true);});
  window.addEventListener('pagehide',event=>{cancelAnimationFrame(frame);frame=0;if(event.persisted)return;disposed=true;resize.disconnect();window.removeEventListener('scroll',invalidate);controls.dispose();preview?.dispose();for(const d of Object.values(drafts))if(d.url)URL.revokeObjectURL(d.url);scene.traverse(obj=>{obj.geometry?.dispose();if(obj.material){const mats=Array.isArray(obj.material)?obj.material:[obj.material];for(const m of mats){m.map?.dispose();m.bumpMap?.dispose();m.dispose();}}});env.dispose();renderer.dispose();});
  window.addEventListener('pageshow',()=>invalidate());
  overlay=createEditOverlay({host,camera:flatCamera,getDraft:()=>drafts[side],getSide:()=>side,bounds,onChange:()=>{syncPanel();draw(side);},onCommit:()=>{}});
  $('#toggle-guides').addEventListener('click',()=>{const value=$('#toggle-guides').getAttribute('aria-pressed')!=='true';$('#toggle-guides').setAttribute('aria-pressed',String(value));overlay.setGuides(value);});
  draw('front');draw('back');syncPanel();setMode('2d');$('#scene-loading').remove();invalidate();
}

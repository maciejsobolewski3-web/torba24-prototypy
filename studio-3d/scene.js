import {colorHex,resolveProduct,valuesFrom,backAllowed,linkedSides,printMode} from '../configuration/config.js?v=client-34';
import * as THREE from 'three';
import {OrbitControls} from '../vendor/three/OrbitControls.js';
import {createStudioEnvironment} from './environment.js?v=client-34';
import {createEditOverlay} from './edit-overlay.js?v=client-34';
import {createLivePreview} from './live-preview.js?v=client-34';
import {initColorControls} from './color-controls.js?v=flow-6';
import {readLogo} from '../logo-file.js';
import {BAG,palette,createBag,presentPackaging} from './model.js?v=client-34';

export async function initStudio(configuration){
  const $=selector=>document.querySelector(selector),host=$('#scene'),status=$('#studio-status');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setClearColor(0x000000,0);
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
  const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Torba 3D. Przeciągnij, aby obrócić. Użyj przycisków Przód, Tył i Detal, aby zmienić widok.');host.append(canvas);
  const scene=new THREE.Scene(),perspectiveCamera=new THREE.PerspectiveCamera(34,1,.1,60);
  const flatCamera=new THREE.OrthographicCamera(-2.5,2.5,2.5,-2.5,.1,60);
  let camera=perspectiveCamera;
  camera.position.set(5.3,3.3,7.5);
  const controls=new OrbitControls(camera,canvas);controls.target.set(0,1.95,0);controls.enablePan=false;controls.enableDamping=true;controls.dampingFactor=.09;controls.minDistance=4.2;controls.maxDistance=13;controls.minPolarAngle=.4;controls.maxPolarAngle=Math.PI*.72;controls.autoRotateSpeed=.65;controls.update();
  // Keep ordinary one-finger page scrolling on phones; two fingers orbit/zoom.
  controls.touches.ONE=innerWidth<=760?null:THREE.TOUCH.ROTATE;controls.touches.TWO=THREE.TOUCH.DOLLY_ROTATE;
  canvas.style.touchAction=innerWidth<=760?'pan-y':'none';
  const environment=createStudioEnvironment(),pmrem=new THREE.PMREMGenerator(renderer),env=pmrem.fromScene(environment,.05);
  scene.environment=env.texture;scene.environmentIntensity=.55;environment.dispose();pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xffffff,0x84967a,.85));
  const key=new THREE.DirectionalLight(0xfff8e9,2.2);key.position.set(-3,7,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-4;key.shadow.camera.right=4;key.shadow.camera.top=5;key.shadow.camera.bottom=-4;key.shadow.normalBias=.035;key.shadow.bias=-.0001;key.shadow.radius=4;scene.add(key);
  // Match the front softbox on the rear so turning the bag does not change its colour.
  const rearKey=key.clone();rearKey.position.set(3,7,-5);scene.add(rearKey);
  let bag=createBag(configuration);if(configuration){if(configuration.options.ribbon)bag.setRibbonColor(colorHex(configuration.options.ribbon.display));if(configuration.options.cord)bag.setHandleColor(colorHex(configuration.options.cord.display));bag.setFinish(configuration.options.finish?.display.toLowerCase().includes('błysk'));}scene.add(bag.group);
  // A baked contact shadow anchors the bag without an expensive post-processing pass.
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;const sc=shadowCanvas.getContext('2d'),gradient=sc.createRadialGradient(64,64,8,64,64,64);gradient.addColorStop(0,'rgba(26,50,31,.22)');gradient.addColorStop(1,'rgba(26,50,31,0)');sc.fillStyle=gradient;sc.fillRect(0,0,128,128);
  const contact=new THREE.Mesh(new THREE.PlaneGeometry(4.8,2.7),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));contact.rotation.x=-Math.PI/2;contact.position.y=.035;scene.add(contact);
  let mode='2d',color=palette.green,preset='green',side='front',frame=0,tween=null,lastTime=0,drag=null,disposed=false;
  const drafts={front:{kind:'example',image:null,url:null,name:'Twoja marka.',size:48,x:0,y:0,sequence:0},back:{kind:'none',image:null,url:null,name:'',size:48,x:0,y:0,sequence:0}};
  let overlay=null,preview=null,pendingFiles=0;
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
  function draw(s){const d=renderDraft(s),c=textures[s].canvas,ctx=c.getContext('2d');ctx.clearRect(0,0,1024,1024);
    if(d.kind!=='none'){
      const b=bounds(d),x=(b.x-b.w/2)*1024,y=(1-b.y-b.h/2)*1024,w=b.w*1024,h=b.h*1024;
      if(d.image)ctx.drawImage(d.image,x,y,w,h);
      else{ctx.fillStyle=color.ink;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`500 ${h*.47}px Georgia,serif`;ctx.fillText('Twoja',x+w/2,y+h*.29,w);ctx.font=`italic 500 ${h*.47}px Georgia,serif`;ctx.fillText('marka.',x+w/2,y+h*.78,w);}
    }
    textures[s].texture.needsUpdate=true;bag.printMeshes[s].visible=printEnabled()&&(s==='front'||canBack())&&d.kind!=='none';overlay?.update();invalidate();document.dispatchEvent(new Event('studio-project-change'));if(sameSides()){const other=s==='front'?'back':'front';textures[other].canvas.getContext('2d').clearRect(0,0,1024,1024);textures[other].canvas.getContext('2d').drawImage(c,0,0);textures[other].texture.needsUpdate=true;bag.printMeshes[other].visible=printEnabled()&&d.kind!=='none';}
  }
  function printEnabled(){return !configuration||printMode(resolveProduct(configuration.productId),valuesFrom(configuration))!=='bez nadruku';}
  function canBack(){return !configuration||backAllowed(resolveProduct(configuration.productId),valuesFrom(configuration),configuration.requests);}
  function sameSides(){return !!configuration&&linkedSides(resolveProduct(configuration.productId),valuesFrom(configuration));}
  function renderDraft(s){return sameSides()?drafts.front:drafts[s];}
  function syncPanel(){const d=renderDraft(side);$('#no-print-note').hidden=printEnabled();
    document.querySelectorAll('[data-side="back"],[data-view="back"]').forEach(b=>b.disabled=!canBack());
    for(const selector of ['.logo-field','#logo-settings'])$(selector).hidden=!printEnabled();
    $('.duplex-print').hidden=!!configuration?.singleSurface;
    const frontLabel=configuration?.family==='pizza'?'Wieczko':configuration?.family==='napkin'?'Strona nadruku':'Przód';
    document.querySelectorAll('[data-side="front"],[data-view="front"]').forEach(b=>b.textContent=frontLabel);
    document.querySelectorAll('[data-side="back"],[data-view="back"]').forEach(b=>b.hidden=!!configuration?.singleSurface);
    $('#copy-print').hidden=false;
    $('#duplex-help').textContent=!printEnabled()?'Najpierw wybierz technikę nadruku w parametrach torby.':!canBack()?'Skopiuj projekt również na drugą stronę. Dostępność tej opcji potwierdzimy przy wycenie.':sameSides()?'Obie strony są połączone. Zmiana logo, wielkości lub położenia aktualizuje przód i tył jednocześnie.':'Jednorazowa kopia. Później edytujesz strony osobno. Po zmianie położenia skopiuj ponownie, jeśli obie strony mają być identyczne.';
if(configuration?.requests?.some(r=>r.type==='printSides')&&printEnabled())$('#duplex-help').textContent+=' Druk na obu stronach potwierdzimy przy wycenie.';
$('#duplex-state').textContent=sameSides()&&drafts.front.kind!=='none'?'Przód i tył · połączone':drafts.front.kind!=='none'&&drafts.back.kind!=='none'?'Przód i tył':drafts.front.kind!=='none'?'Tylko przód':drafts.back.kind!=='none'?'Tylko tył':'Bez nadruku';$('#copy-print').disabled=!printEnabled()||d.kind==='none';$('#copy-print').textContent=sameSides()?'Zobacz identyczny nadruk na tyle':side==='front'?'Skopiuj nadruk na tył':'Skopiuj nadruk na przód';$('#side-label').textContent=side==='front'?frontLabel:'Tył';document.querySelectorAll('[data-side]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.side===side)));$('#logo-kind').textContent=d.kind==='example'?'Tekst startowy':d.kind==='image'?'Twoje logo':'Bez nadruku';$('#upload-label').textContent=d.kind==='image'?'Zmień logo':'Wgraj swoje logo';$('#file-name').textContent=d.name;$('#logo-actions').hidden=d.kind==='none';$('#example').hidden=d.kind!=='none';$('#logo-settings').hidden=!printEnabled()||d.kind==='none';$('#logo-size').value=d.size;$('#size-value').value=d.size+'%';$('#logo-x').value=d.x;$('#logo-y').value=d.y;}
  function setRotation(value){value=value&&mode==='3d';controls.autoRotate=value;$('#rotate').setAttribute('aria-pressed',String(value));$('#rotate').textContent=value?'Zatrzymaj':'Obrót 360°';invalidate();}
  const views={front:{position:[0,2.2,9],target:[0,1.95,0]},back:{position:[0,2.2,-9],target:[0,1.95,0]},detail:{position:[3.2,4.25,4.4],target:[0,2.45,0]},perspective:{position:[5.3,3.3,7.5],target:[0,1.95,0]}};
  function goView(name){setRotation(false);if(mode==='2d'){alignFlatView();invalidate();return;}const view=views[name];document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===name)));const to=new THREE.Vector3(...view.position),target=new THREE.Vector3(...view.target);
    if(reduced.matches){camera.position.copy(to);controls.target.copy(target);controls.update();tween=null;}else{
      // Spherical interpolation keeps the camera outside the bag while changing sides.
      const fromS=new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));const toS=new THREE.Spherical().setFromVector3(to.clone().sub(target));let delta=toS.theta-fromS.theta;while(delta>Math.PI)delta-=Math.PI*2;while(delta<-Math.PI)delta+=Math.PI*2;toS.theta=fromS.theta+delta;
      tween={start:performance.now(),from:fromS,to:toS,targetFrom:controls.target.clone(),targetTo:target};
    }invalidate();
  }
  function selectSide(s){if(s==='back'&&!canBack())return;side=s;syncPanel();goView(s);preview?.orient(s);overlay?.update();status.textContent=s==='front'?'Edytujesz przód torby.':'Edytujesz tył torby. Nadruki obu stron ustawiasz osobno.';}
  function tick(now){frame=0;if(disposed||document.hidden||!stageVisible())return;const dt=Math.min((now-lastTime)/1000||.016,.05);lastTime=now;
    if(tween){const t=Math.min(1,(now-tween.start)/700),e=1-Math.pow(1-t,3);controls.target.lerpVectors(tween.targetFrom,tween.targetTo,e);const s=new THREE.Spherical(THREE.MathUtils.lerp(tween.from.radius,tween.to.radius,e),THREE.MathUtils.lerp(tween.from.phi,tween.to.phi,e),THREE.MathUtils.lerp(tween.from.theta,tween.to.theta,e));camera.position.setFromSpherical(s).add(controls.target);if(t===1)tween=null;}
    const moving=mode==='3d'&&controls.update(dt);presentPackaging(bag.group,mode==='3d');renderer.render(scene,camera);presentPackaging(bag.group,false);overlay?.update();const previewMoving=preview?.render(dt);if(tween||controls.autoRotate||moving||previewMoving)invalidate();
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
    canvas.setAttribute('aria-label',mode==='2d'?'Torba 2D, widok dokładnie na wprost. Strzałkami ustaw położenie nadruku.':'Torba 3D. Przeciągnij, aby obrócić. Strzałkami w lewo i w prawo obrócisz torbę.');
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
    if(split&&!preview){try{preview=createLivePreview({host:$('#live-scene'),scene,contact,invalidate,getProduct:()=>bag.group,onExpand:()=>setMode('3d')});preview.orient(side);}catch(error){console.warn('Live preview unavailable',error);$('.live-preview').hidden=true;$('.studio-stage').classList.remove('is-split');}}
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
  const colorControls=initColorControls({palette,onChange:(next,key)=>{color={...next};if(['kraft','pizza','napkin'].includes(configuration?.family))color.ink='#194f3b';preset=key;bag.setColor(color);draw('front');draw('back');document.dispatchEvent(new Event('studio-project-change'));}});
  document.querySelectorAll('[data-side]').forEach(b=>b.addEventListener('click',()=>selectSide(b.dataset.side)));
  document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{if(['front','back'].includes(b.dataset.view))selectSide(b.dataset.view);else goView(b.dataset.view);}));
  $('#rotate').addEventListener('click',()=>{tween=null;setRotation(!controls.autoRotate);});
  $('#upload').addEventListener('click',()=>$('#logo-file').click());
  $('#logo-file').addEventListener('change',async event=>{const file=event.target.files[0];event.target.value='';if(!file)return;const selected=side,d=renderDraft(selected),sequence=++d.sequence;status.textContent='Przygotowuję logo…';pendingFiles++;
    try{const next=await readLogo(file),img=new Image();img.src=next.url;await img.decode();if(sequence!==d.sequence||disposed){URL.revokeObjectURL(next.url);return;}if(d.url)URL.revokeObjectURL(d.url);Object.assign(d,{kind:'image',image:img,url:next.url,name:next.name,x:0,y:0});draw(selected);syncPanel();status.textContent=`Logo dodane na ${selected==='front'?'przód':'tył'} torby.`;}catch(error){if(sequence===d.sequence)status.textContent=error.message;}finally{pendingFiles--;}
  });
  $('#remove-logo').addEventListener('click',()=>{const d=renderDraft(side);d.sequence++;if(d.url)URL.revokeObjectURL(d.url);Object.assign(d,{kind:'none',image:null,url:null,name:''});draw(side);syncPanel();status.textContent='Nadruk usunięty z wybranej strony.';});
  $('#example').addEventListener('click',()=>{Object.assign(renderDraft(side),{kind:'example',name:'Twoja marka.',x:0,y:0,size:48});draw(side);syncPanel();});
  for(const [id,key] of [['logo-size','size'],['logo-x','x'],['logo-y','y']])$('#'+id).addEventListener('input',event=>{renderDraft(side)[key]=Number(event.target.value);$('#size-value').value=renderDraft(side).size+'%';draw(side);});
  $('#copy-print').addEventListener('click',async()=>{
    if(sameSides()){selectSide('back');return;}
    if(!canBack())document.dispatchEvent(new Event('studio-enable-back'));
    if(!canBack())return;
    const source={...drafts[side]},target=side==='front'?'back':'front',d=drafts[target];
    if(source.kind==='none')return;const sequence=++d.sequence;
    // Each side owns its object URL so removing one print cannot break the other.
    let url=null;pendingFiles++;
    try{if(source.url)url=URL.createObjectURL(await (await fetch(source.url)).blob());
      if(d.sequence!==sequence||disposed){if(url)URL.revokeObjectURL(url);return;}
      if(d.url)URL.revokeObjectURL(d.url);Object.assign(d,source,{url,sequence});draw(target);selectSide(target);syncPanel();
      status.textContent=`Nadruk skopiowany na ${target==='back'?'tył':'przód'}. Kolejne zmiany nie przenoszą się automatycznie — skopiuj ponownie, aby wyrównać obie strony.`;
    }catch{if(url)URL.revokeObjectURL(url);status.textContent='Nie udało się skopiować nadruku. Spróbuj ponownie.';}finally{pendingFiles--;}
  });
  $('#center-logo').addEventListener('click',()=>{renderDraft(side).x=renderDraft(side).y=0;syncPanel();draw(side);});
  // Drag a print in UV space. The sliders remain a keyboard/touch alternative.
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
  function hit(event){const r=canvas.getBoundingClientRect();pointer.set((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);return ray.intersectObjects(Object.values(bag.printMeshes).filter(m=>m.visible))[0];}
  canvas.addEventListener('pointerdown',event=>{if(event.pointerType==='touch'||event.button!==0)return;const h=hit(event);if(!h)return;const s=h.object.userData.side,d=drafts[s],b=bounds(d);if(Math.abs(h.uv.x-b.x)>b.w/2||Math.abs(h.uv.y-b.y)>b.h/2)return;event.stopImmediatePropagation();event.preventDefault();setRotation(false);tween=null;side=s;syncPanel();drag={pointer:event.pointerId,side:s,offsetX:h.uv.x-b.x,offsetY:h.uv.y-b.y};controls.enabled=false;canvas.setPointerCapture(event.pointerId);},true);
  canvas.addEventListener('pointermove',event=>{if(!drag||event.pointerId!==drag.pointer)return;const h=hit(event);if(!h||h.object.userData.side!==drag.side)return;const d=renderDraft(drag.side),b=bounds(d);d.x=THREE.MathUtils.clamp((h.uv.x-drag.offsetX-.5)/Math.max(.005,(.72-b.w)/2)*100,-100,100);d.y=THREE.MathUtils.clamp((h.uv.y-drag.offsetY-.48)/Math.max(.005,(.56-b.h)/2)*100,-100,100);syncPanel();draw(drag.side);});
  const endDrag=()=>{drag=null;controls.enabled=mode==='3d';};canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);canvas.addEventListener('lostpointercapture',endDrag);
  canvas.addEventListener('keydown',event=>{
    if(mode==='2d'){
      const changes={ArrowLeft:['x',-4],ArrowRight:['x',4],ArrowUp:['y',4],ArrowDown:['y',-4]};
      const change=changes[event.key];if(!change||renderDraft(side).kind==='none')return;
      event.preventDefault();const [axis,amount]=change;renderDraft(side)[axis]=THREE.MathUtils.clamp(renderDraft(side)[axis]+amount,-100,100);syncPanel();draw(side);return;
    }
    if(!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();setRotation(false);tween=null;const offset=camera.position.clone().sub(controls.target);offset.applyAxisAngle(new THREE.Vector3(0,1,0),event.key==='ArrowLeft'?-.16:.16);camera.position.copy(controls.target).add(offset);controls.update();invalidate();});
  $('#save-preview').addEventListener('click',()=>{presentPackaging(bag.group,mode==='3d');renderer.render(scene,camera);presentPackaging(bag.group,false);const output=document.createElement('canvas');output.width=canvas.width;output.height=canvas.height;const ctx=output.getContext('2d');ctx.fillStyle='#e7eee3';ctx.fillRect(0,0,output.width,output.height);ctx.drawImage(canvas,0,0);ctx.fillStyle='#456453';ctx.font=`${Math.max(12,output.width*.014)}px sans-serif`;ctx.fillText('PRINTBAG24 / TWÓJ PROJEKT',output.width*.04,output.height*.96);output.toBlob(blob=>{if(!blob){status.textContent='Nie udało się zapisać podglądu.';return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`printbag24-podglad-${mode}-${side==='front'?'przod':'tyl'}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='Podgląd PNG został przygotowany do pobrania.';},'image/png');});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();setRotation(false);$('#scene-fallback').hidden=false;const fallbackParams=new URLSearchParams(location.search);fallbackParams.set('fallback','1');$('#scene-fallback a').href='../configuration/?'+fallbackParams;$('.editor-tools').hidden=true;$('.live-preview').hidden=true;preview?.setActive(false);$('#stage-controls').hidden=true;$('#scene').hidden=true;$('#fallback-message').textContent='Widok 3D został zatrzymany. Odśwież stronę lub otwórz podgląd klasyczny.';document.querySelectorAll('.studio-panel button,.studio-panel input').forEach(el=>el.disabled=true);});
  window.addEventListener('pagehide',event=>{cancelAnimationFrame(frame);frame=0;if(event.persisted)return;disposed=true;resize.disconnect();window.removeEventListener('scroll',invalidate);controls.dispose();preview?.dispose();for(const d of Object.values(drafts))if(d.url)URL.revokeObjectURL(d.url);scene.traverse(obj=>{obj.geometry?.dispose();if(obj.material){const mats=Array.isArray(obj.material)?obj.material:[obj.material];for(const m of mats){m.map?.dispose();m.bumpMap?.dispose();m.dispose();}}});env.dispose();renderer.dispose();});
  window.addEventListener('pageshow',()=>invalidate());
  overlay=createEditOverlay({host,camera:flatCamera,getDraft:()=>printEnabled()?renderDraft(side):{kind:'none',x:0,y:0,size:48},getSide:()=>side,bounds,onChange:()=>{syncPanel();draw(side);},onCommit:()=>{}});
  $('#toggle-guides').addEventListener('click',()=>{const value=$('#toggle-guides').getAttribute('aria-pressed')!=='true';$('#toggle-guides').setAttribute('aria-pressed',String(value));overlay.setGuides(value);});
  if(configuration?.bodyColor)colorControls.set(configuration.bodyColor);
  draw('front');draw('back');syncPanel();setMode('2d');$('#scene-loading').remove();invalidate();
  return {
    configure(next){
      const old=bag;configuration=next;bag=createBag(configuration);scene.remove(old.group);scene.add(bag.group);
      const geometries=new Set(),materials=new Set(),maps=new Set();old.group.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});
      materials.forEach(m=>{if(m.bumpMap)maps.add(m.bumpMap);m.dispose();});geometries.forEach(g=>g.dispose());maps.forEach(t=>t.dispose());
      for(const s of ['front','back'])bag.printMeshes[s].material.map=textures[s].texture;
      if(configuration.options.ribbon)bag.setRibbonColor(colorHex(configuration.options.ribbon.display));
      if(configuration.options.cord)bag.setHandleColor(colorHex(configuration.options.cord.display));
      bag.setFinish(configuration.options.finish?.display.toLowerCase().includes('błysk'));
      colorControls.set(configuration.bodyColor);if(!canBack())side='front';
      draw('front');draw('back');syncPanel();alignFlatView();overlay?.update();invalidate();
    },
    details:()=>({configuration:configuration?{...configuration,bodyColor:color.body}:undefined,color:{...color},preset,faces:Object.fromEntries(['front','back'].map(s=>[s,{kind:printEnabled()&&(s==='front'||canBack())?renderDraft(s).kind:'none'}]))}),
    async snapshot(){
      if(pendingFiles)throw new Error('Poczekaj na przygotowanie pliku.');
      const faces={};
      for(const s of ['front','back']){
        const d={...renderDraft(s)};if(!printEnabled()||(s==='back'&&!canBack()))Object.assign(d,{kind:'none',url:null,name:''});
        faces[s]={kind:d.kind,name:d.name,size:d.size,x:d.x,y:d.y,blob:d.url?await(await fetch(d.url)).blob():null};
      }
      const thumbnails={},originalSize=renderer.getSize(new THREE.Vector2()),ratio=renderer.getPixelRatio(),contactVisible=contact.visible;
      const photoCamera=new THREE.OrthographicCamera(-2,2,2.34,-2.34,.1,60);
      try{
        renderer.setPixelRatio(1);renderer.setSize(480,560,false);contact.visible=false;
        for(const s of ['front','back']){
          photoCamera.position.set(0,2.02,s==='front'?9:-9);photoCamera.lookAt(0,2.02,0);photoCamera.updateMatrixWorld();renderer.render(scene,photoCamera);
          const out=document.createElement('canvas');out.width=480;out.height=560;const ctx=out.getContext('2d');ctx.fillStyle='#e5ede3';ctx.fillRect(0,0,480,560);ctx.drawImage(canvas,0,0);
          thumbnails[s]=out.toDataURL('image/jpeg',.87);
        }
      }finally{contact.visible=contactVisible;renderer.setPixelRatio(ratio);renderer.setSize(originalSize.x,originalSize.y,false);invalidate();}
      return {version:configuration?2:1,product:configuration?.productId||'premium',configuration:configuration?{...configuration,bodyColor:color.body}:undefined,color:{...color},preset,faces,thumbnails};
    },
    async restore(project){
      for(const s of ['front','back']){
        const saved=project.faces[s],d=drafts[s];let url=null,img=null;
        if(saved.blob){url=URL.createObjectURL(saved.blob);img=new Image();img.src=url;try{await img.decode();}catch(error){URL.revokeObjectURL(url);throw error;}}
        if(d.url)URL.revokeObjectURL(d.url);
        Object.assign(d,{...saved,url,image:img,sequence:d.sequence+1});
      }
      colorControls.set(project.color.body,project.preset);draw('front');draw('back');syncPanel();setMode('2d');
      status.textContent='Projekt przywrócony razem z plikami i nadrukami obu stron.';
    }
  };
}

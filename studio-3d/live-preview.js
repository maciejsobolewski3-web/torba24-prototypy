import {presentPackaging} from './model.js?v=merchant-33';
import * as THREE from 'three';
import {createStudioEnvironment} from './environment.js?v=merchant-33';
import {OrbitControls} from '../vendor/three/OrbitControls.js';

export function createLivePreview({host,scene,contact,invalidate,getProduct,onExpand}){
  const camera=new THREE.PerspectiveCamera(34,1,.1,60);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.25));renderer.setClearColor(0,0);
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
  // Render-target textures belong to their WebGL context, so each view owns its environment.
  const room=createStudioEnvironment(),pmrem=new THREE.PMREMGenerator(renderer),env=pmrem.fromScene(room,.05);room.dispose();pmrem.dispose();
  const canvas=renderer.domElement;host.append(canvas);canvas.tabIndex=0;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Podgląd 3D tego samego projektu. Przeciągnij, aby obrócić, lub użyj strzałek w lewo i w prawo.');
  const controls=new OrbitControls(camera,canvas);controls.target.set(0,1.95,0);controls.enablePan=false;controls.enableDamping=true;controls.dampingFactor=.09;controls.minDistance=6;controls.maxDistance=14;controls.minPolarAngle=.4;controls.maxPolarAngle=Math.PI*.72;
  let active=false,failed=false;
  function orient(side){controls.enableDamping=false;controls.update();controls.enableDamping=true;camera.position.set(5.3,3.3,side==='front'?7.5:-7.5);controls.target.set(0,1.95,0);controls.update();invalidate();}
  controls.addEventListener('change',invalidate);
  canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const offset=camera.position.clone().sub(controls.target);offset.applyAxisAngle(new THREE.Vector3(0,1,0),e.key==='ArrowLeft'?-.16:.16);camera.position.copy(controls.target).add(offset);controls.update();invalidate();});
  const resize=new ResizeObserver(()=>{const r=host.getBoundingClientRect();if(!r.width||!r.height)return;camera.aspect=r.width/r.height;camera.updateProjectionMatrix();renderer.setSize(r.width,r.height);invalidate();});resize.observe(host);
  document.querySelector('#expand-preview').addEventListener('click',onExpand);
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();active=false;failed=true;host.closest('.live-preview').hidden=true;host.closest('.studio-stage').classList.remove('is-split');});
  orient('front');
  return {
    get failed(){return failed;},orient,setActive(value){active=value&&!failed;controls.enabled=active;},
    render(dt){if(!active)return false;const moving=controls.update(dt);const was=contact.visible;contact.visible=true;const environment=scene.environment;scene.environment=env.texture;presentPackaging(getProduct(),true);renderer.render(scene,camera);presentPackaging(getProduct(),false);scene.environment=environment;contact.visible=was;return moving;},
    dispose(){resize.disconnect();controls.dispose();env.dispose();renderer.dispose();}
  };
}

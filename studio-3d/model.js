import * as THREE from 'three';

export const BAG = {width:3.2,height:2.6,depth:1.08,bottom:.07};
export const palette = {
  green:{name:'Leśna zieleń',body:'#164f3c',inside:'#285343',ink:'#f1edda'},
  ivory:{name:'Ciepła biel',body:'#e9e4d7',inside:'#c6bcaa',ink:'#194f3b'},
  kraft:{name:'Naturalny kraft',body:'#b79263',inside:'#9b794e',ink:'#244833'}
};
function paperGrain(){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
  const ctx=canvas.getContext('2d'), data=ctx.createImageData(256,256);
  let seed=17;
  for(let i=0;i<data.data.length;i+=4){seed=(seed*16807)%2147483647;const n=110+seed%40;data.data.set([n,n,n,255],i);}
  ctx.putImageData(data,0,0);
  const texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(4,4);return texture;
}
export function surfacePoint(u,v,back=false,offset=0){
  const soft=BAG.cloth, cinch=BAG.drawstring?1-.15*Math.pow(v,8):1;
  const x=(u-.5)*(BAG.width-.12*(1-v))*cinch;
  const wave=soft?(.075*Math.sin(u*22+v*4)*Math.pow(1-v,2)+.055*Math.sin(u*31+v*5)*Math.pow(v,2)+.025*Math.sin(u*18-v*8))*Math.sin(Math.PI*u)*Math.sin(Math.PI*v):0;
  const z=BAG.depth/2+(soft?.075:.028)*Math.sin(Math.PI*u)*Math.sin(Math.PI*v)+wave+offset;
  const y=BAG.bottom+v*BAG.height-(soft?.045*Math.sin(Math.PI*u)*Math.pow(v,12):0);
  return [back?-x:x,y,back?-z:z];
}
function panelGeometry(back=false,offset=0){
  const pos=[],uv=[],indices=[],nx=24,ny=20;
  for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){
    const u=i/nx,v=j/ny;
    pos.push(...surfacePoint(u,v,back,offset));uv.push(u,v);
  }
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1;indices.push(a,b,d,a,d,c);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();return geo;
}
function sideGeometry(sign){
  const pos=[],uv=[],idx=[],nx=16,ny=16;
  for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){
    const t=i/nx*2-1,v=j/ny;
    const tuck=(BAG.cloth?.025:.18)*(1-Math.abs(t))*Math.sin(Math.PI*v/2);
    const cinch=BAG.drawstring?1-.15*Math.pow(v,8):1;
    pos.push(sign*((BAG.width-.12*(1-v))*cinch/2-tuck),BAG.bottom+v*BAG.height,t*BAG.depth/2);uv.push(i/nx,v);
  }
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1;idx.push(a,b,d,a,d,c);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();return geo;
}
function fabricGrain(jute){
  const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');
  ctx.fillStyle='#888';ctx.fillRect(0,0,256,256);
  for(let y=0;y<256;y+=4)for(let x=0;x<256;x+=4){
    const n=115+((x*13+y*7)%35);ctx.fillStyle=`rgb(${n},${n},${n})`;ctx.fillRect(x,y,3,3);
    ctx.fillStyle=(x+y)%8?'#aaa':'#666';ctx.fillRect(x,y,1,3);
  }
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(jute?3:9,jute?3:9);return t;
}
function strapGeometry(curve,width){
 const pos=[],uv=[],idx=[],n=80;
 for(let i=0;i<=n;i++){const t=i/n,p=curve.getPoint(t),d=curve.getTangent(t),normal=new THREE.Vector3(-d.y,d.x,0).normalize();
  for(const sign of [-1,1]){const q=p.clone().addScaledVector(normal,width*.5*sign);pos.push(q.x,q.y,q.z);uv.push(sign===-1?0:1,t);}
  if(i<n){const a=i*2;idx.push(a,a+1,a+3,a,a+3,a+2);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;
}
export function createBag(configuration){
  const family=configuration?.family||'laminated';BAG.cloth=['cotton','jute','drawstring'].includes(family);BAG.drawstring=family==='drawstring';
  if(configuration?.dimensions){const d=configuration.dimensions,k=Math.min(3.2/d.width,2.8/d.height);BAG.width=d.width*k;BAG.height=d.height*k;BAG.depth=Math.max(.2,d.depth*k);}

  const group=new THREE.Group(),grain=BAG.cloth?fabricGrain(family==='jute'):paperGrain();
  const paper=new THREE.MeshStandardMaterial({color:palette.green.body,roughness:BAG.cloth?1:.83,bumpMap:grain,bumpScale:BAG.cloth?.025:.009,side:THREE.DoubleSide});
  const inner=new THREE.MeshStandardMaterial({color:palette.green.inside,roughness:.93,side:THREE.DoubleSide});
  const printMeshes={};
  for(const side of ['front','back']){
    const back=side==='back';
    const body=new THREE.Mesh(panelGeometry(back),paper);body.castShadow=true;body.receiveShadow=true;group.add(body);
    const print=new THREE.Mesh(panelGeometry(back,.003),new THREE.MeshStandardMaterial({transparent:true,alphaTest:.015,roughness:.86,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}));
    print.userData.side=side;group.add(print);printMeshes[side]=print;
    if(!BAG.cloth){const fold=new THREE.Mesh(new THREE.BoxGeometry(BAG.width-.01,.23,.014),inner);fold.position.set(0,BAG.bottom+BAG.height-.12,(back?-1:1)*(BAG.depth/2-.014));group.add(fold);
    const edge=new THREE.Mesh(new THREE.BoxGeometry(BAG.width,.012,.023),paper);edge.position.set(0,BAG.bottom+BAG.height,(back?-1:1)*BAG.depth/2);group.add(edge);}

  }
  for(const sign of [-1,1]){const side=new THREE.Mesh(sideGeometry(sign),paper);side.castShadow=true;side.receiveShadow=true;group.add(side);}
  const bottom=new THREE.Mesh(new THREE.BoxGeometry(BAG.width-.16,.025,BAG.depth-.04),inner);bottom.position.y=.08;bottom.receiveShadow=true;group.add(bottom);
  const ropeCanvas=document.createElement('canvas');ropeCanvas.width=ropeCanvas.height=128;const rc=ropeCanvas.getContext('2d');
  rc.fillStyle='#aaa';rc.fillRect(0,0,128,128);rc.strokeStyle='#eee';rc.lineWidth=3;
  for(let i=-128;i<256;i+=12){rc.beginPath();rc.moveTo(i,0);rc.lineTo(i+100,128);rc.stroke();}
  const ropeTexture=new THREE.CanvasTexture(ropeCanvas);ropeTexture.wrapS=ropeTexture.wrapT=THREE.RepeatWrapping;ropeTexture.repeat.set(18,2);
  const ropeMat=new THREE.MeshStandardMaterial({color:'#e5d8b9',roughness:.96,bumpMap:ropeTexture,bumpScale:.012});
  const eyelet=new THREE.MeshStandardMaterial({color:'#79867c',metalness:.65,roughness:.4});
  const ropeMaterials=[ropeMat];
  if(BAG.cloth){
    for(const back of [false,true])for(const v of [.025,.955,.975]){
      const points=[];for(let i=0;i<=80;i++)points.push(new THREE.Vector3(...surfacePoint(.015+i/80*.97,v,back,.004)));
      const seam=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineDashedMaterial({color:'#ffffff',transparent:true,opacity:.27,dashSize:.016,gapSize:.012}));seam.computeLineDistances();group.add(seam);
    }
  }
  for(const sign of [-1,1]){
    if(BAG.drawstring){
      for(const x of [-1,1]){const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(x*BAG.width*.43,BAG.height,sign*BAG.depth/2),new THREE.Vector3(x*BAG.width*.55,BAG.height*.84,sign*.14),new THREE.Vector3(x*BAG.width*.57,.13,sign*.12),new THREE.Vector3(x*BAG.width*.48,.09,sign*.1)]);group.add(new THREE.Mesh(new THREE.TubeGeometry(curve,48,.025,7,false),ropeMat));}
      continue;
    }
    const z=sign*(BAG.depth/2+.03),w=BAG.width/3.2,top=BAG.bottom+BAG.height-.24;
    const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-.88*w,top,z),new THREE.Vector3(-.8*w,top+.62,z+sign*.08),new THREE.Vector3(-.48*w,top+1.29,z+sign*.09),new THREE.Vector3(0,top+1.51,z+sign*.08),new THREE.Vector3(.48*w,top+1.29,z+sign*.09),new THREE.Vector3(.8*w,top+.62,z+sign*.08),new THREE.Vector3(.88*w,top,z)]);
    if(BAG.cloth){
      const short=/krótk/i.test(configuration?.specs?.Uchwyt||''),rise=short?.66:1.45;
      const clothCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(-BAG.width*.27,top-.05,z),new THREE.Vector3(-BAG.width*.26,top+rise*.72,z+sign*.055),new THREE.Vector3(0,top+rise,z+sign*.10),new THREE.Vector3(BAG.width*.26,top+rise*.72,z+sign*.055),new THREE.Vector3(BAG.width*.27,top-.05,z)]);
      const handle=new THREE.Mesh(strapGeometry(clothCurve,.105),paper);handle.castShadow=true;group.add(handle);continue;
    }
    if(family==='kraft'){
      const flat=/płaski/.test(configuration?.specs?.Uchwyt||''),half=BAG.width*.25,rise=Math.min(.72,BAG.height*.3),y=BAG.bottom+BAG.height;
      const points=[[-half,y-.16],[-half,y+rise*.8],[-half*.78,y+rise],[half*.78,y+rise],[half,y+rise*.8],[half,y-.16]].map(([x,y])=>new THREE.Vector3(x,y,sign*(BAG.depth/2-.035)));
      const paperCurve=new THREE.CatmullRomCurve3(points,false,'centripetal',.1);
      const mat=paper.clone();mat.side=THREE.DoubleSide;ropeMaterials.push(mat);
      const handle=new THREE.Mesh(flat?strapGeometry(paperCurve,.16):new THREE.TubeGeometry(paperCurve,64,.026,8,false),mat);handle.castShadow=true;group.add(handle);continue;
    }
    const handle=new THREE.Mesh(new THREE.TubeGeometry(curve,96,family==='kraft'?.027:.043,10,false),ropeMat);handle.castShadow=true;group.add(handle);
    if(family==='kraft')continue;
    const frames=curve.computeFrenetFrames(240,false);
    for(const phase of [0,Math.PI]){
      const strandPoints=[];
      for(let i=0;i<=240;i++){const angle=i/240*Math.PI*2*38+phase;strandPoints.push(curve.getPointAt(i/240).addScaledVector(frames.normals[i],Math.cos(angle)*.042).addScaledVector(frames.binormals[i],Math.sin(angle)*.042));}
      const strand=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(strandPoints),360,.004,4,false),new THREE.MeshStandardMaterial({color:'#cfc3a9',roughness:1}));group.add(strand);ropeMaterials.push(strand.material);
    }
    for(const x of [-.88,.88]){const ring=new THREE.Mesh(new THREE.TorusGeometry(.059,.011,8,20),eyelet);ring.position.set(x*w,top,z);group.add(ring);}
  }
  if(BAG.cloth&&!BAG.drawstring){ropeMat.dispose();ropeTexture.dispose();eyelet.dispose();}
  else if(BAG.drawstring||family==='kraft')eyelet.dispose();
  const ribbonMaterial=new THREE.MeshStandardMaterial({color:'#e8d8bc',roughness:.6,side:THREE.DoubleSide});
  if(family==='giftbox'){
    for(const sign of [-1,1]){
      const ribbon=new THREE.Mesh(new THREE.PlaneGeometry(.10,BAG.height*.96),ribbonMaterial);ribbon.position.set(0,BAG.bottom+BAG.height*.48,sign*(BAG.depth/2+.035));group.add(ribbon);
      for(const direction of [-1,1]){const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(0,BAG.height-.12,sign*(BAG.depth/2+.07)),new THREE.Vector3(direction*.32,BAG.height+.11,sign*(BAG.depth/2+.10)),new THREE.Vector3(direction*.30,BAG.height-.10,sign*(BAG.depth/2+.12)),new THREE.Vector3(0,BAG.height-.12,sign*(BAG.depth/2+.07))]);group.add(new THREE.Mesh(strapGeometry(curve,.07),ribbonMaterial));}
    }
  }else ribbonMaterial.dispose();
  return {group,printMeshes,setRibbonColor(hex){if(family==='giftbox')ribbonMaterial.color.set(hex);},setHandleColor(hex){ropeMaterials.forEach(m=>m.color.set(hex));},setFinish(gloss){paper.roughness=BAG.cloth?1:gloss?.3:.83;for(const mesh of Object.values(printMeshes))mesh.material.roughness=gloss?.3:.86;},setColor(value){const colors=typeof value==='string'?palette[value]:value;paper.color.set(colors.body);inner.color.set(colors.inside);if(family==='kraft')ropeMaterials.forEach(m=>m.color.set(colors.body));}};
}

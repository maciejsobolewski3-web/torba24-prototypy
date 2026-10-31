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
function panelGeometry(back=false,offset=0){
  const pos=[],uv=[],indices=[],nx=24,ny=20;
  for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){
    const u=i/nx,v=j/ny;
    const x=(u-.5)*(BAG.width-.12*(1-v));
    const z=BAG.depth/2+.028*Math.sin(Math.PI*u)*Math.sin(Math.PI*v)+offset;
    pos.push(back?-x:x,BAG.bottom+v*BAG.height,back?-z:z);uv.push(u,v);
  }
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1;indices.push(a,b,d,a,d,c);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();return geo;
}
function sideGeometry(sign){
  const pos=[],uv=[],idx=[],nx=16,ny=16;
  for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){
    const t=i/nx*2-1,v=j/ny;
    const tuck=.18*(1-Math.abs(t))*Math.sin(Math.PI*v/2);
    pos.push(sign*((BAG.width-.12*(1-v))/2-tuck),BAG.bottom+v*BAG.height,t*BAG.depth/2);uv.push(i/nx,v);
  }
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1;idx.push(a,b,d,a,d,c);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();return geo;
}
export function createBag(){
  const group=new THREE.Group(),grain=paperGrain();
  const paper=new THREE.MeshStandardMaterial({color:palette.green.body,roughness:.83,bumpMap:grain,bumpScale:.009,side:THREE.DoubleSide});
  const inner=new THREE.MeshStandardMaterial({color:palette.green.inside,roughness:.93,side:THREE.DoubleSide});
  const printMeshes={};
  for(const side of ['front','back']){
    const back=side==='back';
    const body=new THREE.Mesh(panelGeometry(back),paper);body.castShadow=true;body.receiveShadow=true;group.add(body);
    const print=new THREE.Mesh(panelGeometry(back,.003),new THREE.MeshStandardMaterial({transparent:true,alphaTest:.015,roughness:.86,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}));
    print.userData.side=side;group.add(print);printMeshes[side]=print;
    const fold=new THREE.Mesh(new THREE.BoxGeometry(3.19,.23,.014),inner);fold.position.set(0,2.55,back?-.526:.526);group.add(fold);
    const edge=new THREE.Mesh(new THREE.BoxGeometry(3.2,.012,.023),paper);edge.position.set(0,2.67,back?-.54:.54);group.add(edge);
  }
  for(const sign of [-1,1]){const side=new THREE.Mesh(sideGeometry(sign),paper);side.castShadow=true;side.receiveShadow=true;group.add(side);}
  const bottom=new THREE.Mesh(new THREE.BoxGeometry(3.04,.025,1.04),inner);bottom.position.y=.08;bottom.receiveShadow=true;group.add(bottom);
  const ropeCanvas=document.createElement('canvas');ropeCanvas.width=ropeCanvas.height=128;const rc=ropeCanvas.getContext('2d');
  rc.fillStyle='#aaa';rc.fillRect(0,0,128,128);rc.strokeStyle='#eee';rc.lineWidth=3;
  for(let i=-128;i<256;i+=12){rc.beginPath();rc.moveTo(i,0);rc.lineTo(i+100,128);rc.stroke();}
  const ropeTexture=new THREE.CanvasTexture(ropeCanvas);ropeTexture.wrapS=ropeTexture.wrapT=THREE.RepeatWrapping;ropeTexture.repeat.set(18,2);
  const ropeMat=new THREE.MeshStandardMaterial({color:'#e5d8b9',roughness:.96,bumpMap:ropeTexture,bumpScale:.012});
  const eyelet=new THREE.MeshStandardMaterial({color:'#79867c',metalness:.65,roughness:.4});
  for(const sign of [-1,1]){
    const z=sign*.57;
    const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-.88,2.43,z),new THREE.Vector3(-.8,3.05,z+sign*.08),new THREE.Vector3(-.48,3.72,z+sign*.09),new THREE.Vector3(0,3.94,z+sign*.08),new THREE.Vector3(.48,3.72,z+sign*.09),new THREE.Vector3(.8,3.05,z+sign*.08),new THREE.Vector3(.88,2.43,z)]);
    const handle=new THREE.Mesh(new THREE.TubeGeometry(curve,96,.043,10,false),ropeMat);handle.castShadow=true;group.add(handle);
    const frames=curve.computeFrenetFrames(240,false);
    for(const phase of [0,Math.PI]){
      const strandPoints=[];
      for(let i=0;i<=240;i++){const angle=i/240*Math.PI*2*38+phase;strandPoints.push(curve.getPointAt(i/240).addScaledVector(frames.normals[i],Math.cos(angle)*.042).addScaledVector(frames.binormals[i],Math.sin(angle)*.042));}
      const strand=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(strandPoints),360,.004,4,false),new THREE.MeshStandardMaterial({color:'#cfc3a9',roughness:1}));group.add(strand);
    }
    for(const x of [-.88,.88]){const ring=new THREE.Mesh(new THREE.TorusGeometry(.059,.011,8,20),eyelet);ring.position.set(x,2.43,z);group.add(ring);}
  }
  return {group,printMeshes,setColor(value){const colors=typeof value==='string'?palette[value]:value;paper.color.set(colors.body);inner.color.set(colors.inside);}};
}

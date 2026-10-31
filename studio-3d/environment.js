import * as THREE from 'three';

// A studio with matching softboxes on opposite sides of the product.
// The same environment is built in each WebGL context (editor and live preview).
export function createStudioEnvironment(){
 const scene=new THREE.Scene();
 const geometry=new THREE.BoxGeometry();
 const roomMaterial=new THREE.MeshBasicMaterial({color:new THREE.Color(.3,.3,.3),side:THREE.BackSide});
 const room=new THREE.Mesh(geometry,roomMaterial);room.scale.set(24,24,24);scene.add(room);
 const softboxMaterial=new THREE.MeshBasicMaterial({color:new THREE.Color(4,4,4)});
 for(const sign of [-1,1]){
  const box=new THREE.Mesh(geometry,softboxMaterial);
  box.position.set(-3*sign,5,6*sign);box.scale.set(8,10,.1);box.lookAt(0,2,0);scene.add(box);
  const fill=new THREE.Mesh(geometry,softboxMaterial);
  fill.position.set(6*sign,3,sign);fill.scale.set(.1,5,3);scene.add(fill);
 }
 const top=new THREE.Mesh(geometry,softboxMaterial);top.position.y=9;top.scale.set(6,.1,6);scene.add(top);
 scene.dispose=()=>{geometry.dispose();roomMaterial.dispose();softboxMaterial.dispose();};
 return scene;
}

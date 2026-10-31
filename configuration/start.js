import {resolveProduct,defaults,configuration,baseColor} from './config.js?v=catalog-22';
import {id,put} from '../order/store.js?v=catalog-22';
export async function startConfiguration({product:legacyProduct,quantity=100,logo,color}){
 const p=resolveProduct(legacyProduct),values=defaults(p);
 if(logo){const print=p.fields.find(f=>f.id==='printMode');if(print)values.printMode=(print.options.find(o=>o.label.includes('DTF'))||print.options.find(o=>o.label!=='bez nadruku')).id;}
 const body=['laminated','giftbox'].includes(p.family)?color||baseColor(p):baseColor(p),projectId=id();
 const face={kind:'none',name:'',size:48,x:0,y:0,blob:null};
 const front=logo?{...face,kind:'image',name:logo.name,blob:await(await fetch(logo.url)).blob()}:face;
 await put('projects',{version:2,id:projectId,product:p.id,configuration:configuration(p,values,body),color:{body,name:p.specs.Kolor||'Własny kolor',inside:body,ink:'#174f3d'},preset:null,quantity,faces:{front,back:{...face}},thumbnails:{},updatedAt:Date.now()});
 location.href=new URL(`./?project=${projectId}`,import.meta.url).href;
}

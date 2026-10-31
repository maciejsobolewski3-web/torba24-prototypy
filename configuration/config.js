import catalog from './catalog-data.js?v=offer-32';
import archive from './catalog-bagpack-archive.js';
export {catalog};
export const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const productById=id=>catalog.products.find(p=>p.id===id);
export const aliases={premium:'papier-skrecany',kraft:'papier-plaski',white:'papier-plaski',cotton:'bawelna','cotton-green':'bawelna',gift:'papier-plaski'};
export function resolveCurrentProduct(id){return productById(id)||productById(aliases[id])||catalog.products.find(p=>p.id==='papier-skrecany');}
// Archived SKUs can still be rendered when a customer opens an older saved project.
export function resolveProduct(id){return productById(id)||archive.products.find(p=>p.id===id)||resolveCurrentProduct(id);}
export function stockColor(product,values){const name=label(product,values,'stockColor');return name==='Brązowy kraft'?'#aa8157':colorHex(name);}
export function defaults(product){return Object.fromEntries(product.fields.map(f=>[f.id,(f.id==='size'?f.options.find(o=>o.label==='24x9x26'):null)?.id||f.options[0].id]));}
export function label(product,values,key){const f=product.fields.find(f=>f.id===key);return f?.options.find(o=>o.id===values[key])?.label||'';}
export function fieldOptions(product,values,field){
 if(!product.variantMatrix||!['weight','stockColor'].includes(field.id))return field.options;
 const matches=product.variantMatrix.filter(v=>v.size===values.size&&(field.id!=='stockColor'||!v.weight||v.weight===values.weight));
 return field.options.filter(o=>matches.some(v=>v[field.id]===o.id));
}
export function normalizeValues(product,values){
 const next={...defaults(product),...values};
 for(const field of product.fields){const options=fieldOptions(product,next,field);if(!options.some(o=>o.id===next[field.id]))next[field.id]=options[0]?.id;}
 return next;
}
export function activeFields(product,values){const mode=label(product,values,'printMode');return product.fields.filter(f=>{
 if(['printing','inkCount','digitalFormat'].includes(f.id)&&mode==='bez nadruku')return false;
 if(f.id==='inkCount')return values.printing==='screen';
 if(f.id==='digitalFormat')return values.printing==='digital';
 if(f.id==='inkFront')return mode!=='bez nadruku'&&!mode.includes('DTF');
 if(f.id==='inkBack')return mode.includes('różne');
 if(f.id==='dtfSize')return mode.includes('DTF');
 return true;
}).map(f=>({...f,options:fieldOptions(product,values,f)}));}
export function dimensions(product,values){const raw=label(product,values,'size')||product.size;const n=raw.match(/\d+(?:[.,]\d+)?/g)?.map(x=>Number(x.replace(',','.')))||[32,12,26];
 // Cotton gusset notation 38×42+10+10 means width/height followed by gussets.
 if(raw.includes('+'))return {width:n[0],height:n[1],depth:n[2]||0,label:raw.replace(/\s*cm$/,'')+' cm'};
 if(product.family==='cotton'&&n.length===4)return {width:n[0],depth:n[1],height:n[3],label:raw.replace(/\s*cm$/,'')+' cm'};
 if(product.family==='drawstring'&&n.length===3)return {width:n[0],height:n[1],depth:n[2],label:raw.replace(/\s*cm$/,'')+' cm'};
 if(n.length===2)return {width:n[0],height:n[1],depth:0,label:raw.replace(/\s*cm$/,'')+' cm'};
 return {width:n[0],depth:n[1],height:n[2],label:raw.replace(/\s*cm$/,'')+' cm'};
}
export const colorHex=name=>({'pastelowa niebieska':'#a7c4d0','pastelowa różowa':'#e0b9c0','pastelowa zielona':'#bed2b9','brązowy kraft':'#aa8157',biały:'#f3f0e7','biały perła':'#f2ece3',beżowy:'#d4c3a2',cytrynowy:'#efe47c',żółty:'#edbf45',groszkowy:'#a7ba75','zielony jasny':'#98b294',zielony:'#32624d','zielony ciemny':'#164d3b',ciemnozielony:'#164d3b',jasnozielony:'#98b294',pomarańczowy:'#d88344',szary:'#9a9e9b','szary ciemny':'#555c59',fioletowy:'#765482','niebieski jasny':'#94bccb',jasnoniebieski:'#94bccb',błękitny:'#94bccb','niebieski chabrowy':'#3c62a3','niebieski royal':'#3c62a3',niebieski:'#3c62a3',granatowy:'#263d5a',srebrny:'#b6bfbb',czerwony:'#af3e43',różowy:'#cf91a5',purpurowy:'#8d3d6b',bordo:'#693b46',bordowy:'#693b46',złoty:'#baa36b',gold:'#b19554','złoty jasny':'#d9c48d',brązowy:'#aa8157','brązowy ciemny':'#654e3f',czarny:'#292e2c',naturalny:'#dfd4bc',natural:'#dfd4bc','royal heather':'#466a9b','black heather':'#444a49',ecru:'#e8ddc3',turkusowy:'#428f8c'})[name?.toLowerCase()]||'#d5c5a5';
export function baseColor(product){if(product.fields.some(f=>f.id==='stockColor'))return stockColor(product,defaults(product));return ['laminated','giftbox'].includes(product.family)?'#164f3c':colorHex(product.specs.Kolor||(product.family==='premium-kraft'?'brązowy':'naturalny'));}
export function printMode(product,values){return label(product,values,'printMode');}
export function backAllowed(product,values,requests=[]){return (printMode(product,values)!=='bez nadruku'&&requests.some(r=>r.type==='printSides'))|| !product.fields.some(f=>f.id==='printMode')||printMode(product,values).includes('dwustronny');}
export const linkedSides=(product,values)=>printMode(product,values).includes('taki sam');
export function validate(product,values,quantity){
 if(!product)return 'Wybierz model.';
 for(const f of activeFields(product,values))if(!f.options.some(o=>o.id===values[f.id]))return 'Wybierz: '+f.label+'.';
 if(!Number.isInteger(Number(quantity))||quantity<1||quantity>100000)return 'Wpisz nakład od 1 do 100 000 szt.';
 return '';
}
export function configuration(product,values,color,requests=[]){values=normalizeValues(product,values);if(product.fields.some(f=>f.id==='stockColor'))color=stockColor(product,values);return {schemaVersion:1,catalogVersion:catalog.auditedAt,productId:product.id,family:product.family,productName:product.name,dimensions:dimensions(product,values),specs:{...product.specs,...(values.weight?{Gramatura:label(product,values,'weight')}:{}),...(values.stockColor?{Kolor:label(product,values,'stockColor')}:{})},options:Object.fromEntries(activeFields(product,values).map(f=>[f.id,{value:values[f.id],label:f.label,display:label(product,values,f.id)}])),bodyColor:color,requests,pricing:'quote',productionStatus:product.productionStatus,confirmationRequired:product.confirmationRequired||[]};}
export function valuesFrom(config){return Object.fromEntries(Object.entries(config.options).map(([k,v])=>[k,v.value]));}
export function printBounds(d,width,height,aspect=1.45){let w=d.size/100,h=w*width/height/aspect;if(h>.5){w*=.5/h;h=.5;}return {w,h,x:.5+d.x/100*(.72-w)/2,y:.48+d.y/100*(.56-h)/2};}
// Front elevation, not a perspective photo. Shared by the live editor and saved previews.
export function bagSVG(product,values,{body=baseColor(product),face=null,image='',guides=false,ink='#174f3d'}={}){
 const dim=dimensions(product,values),scale=Math.min(340/dim.width,360/dim.height),w=dim.width*scale,h=dim.height*scale,x=(500-w)/2,y=450-h;
 const cord=product.family==='kraft'?body:colorHex(label(product,values,'cord')||'ecru'),cloth=['cotton','drawstring','jute'].includes(product.family),drawstring=product.family==='drawstring',gift=product.family==='giftbox';
 const handleRise=Math.min(100,h*.4),left=x+w*.26,right=x+w*.74;
 let shape=`<path d="M${x} ${y}H${x+w}L${x+w-4} ${y+h}Q250 ${y+h+5} ${x+4} ${y+h}Z" fill="${escape(body)}" stroke="#143e342c" stroke-width="1.5"/>`;
 const flat=product.family==='kraft'&&/płaski/.test(product.specs.Uchwyt||'');
 const handle=flat?`<path d="M${left} ${y+10}V${y-handleRise*.7}H${right}V${y+10}"/>`:drawstring?`<path d="M${x} ${y+10}Q250 ${y+25} ${x+w} ${y+10}M${x+5} ${y+10}L${x-20} ${y+h}M${x+w-5} ${y+10}L${x+w+20} ${y+h}"/>`:`<path d="M${left} ${y+12}C${left} ${y-handleRise} ${right} ${y-handleRise} ${right} ${y+12}"/>`;
 shape+=`<g fill="none" stroke="${cloth?escape(body):cord}" stroke-width="${flat?15:cloth?13:6}" stroke-linecap="round">${handle}</g>`;
 if(cloth)shape+=`<path d="M${x+9} ${y+16}H${x+w-9}M${x+9} ${y+7}V${y+h-9}H${x+w-9}V${y+7}" fill="none" stroke="#163c3430" stroke-dasharray="3 3"/>`;
 if(product.family==='jute')shape+=`<defs><pattern id="weave" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M0 0h5M0 0v5" stroke="#715732" opacity=".15"/></pattern></defs><rect x="${x+4}" y="${y+2}" width="${w-8}" height="${h-4}" fill="url(#weave)"/>`;
 if(label(product,values,'finish').toLowerCase().includes('błysk'))shape+=`<path d="M${x+w*.55} ${y+1}H${x+w*.8}L${x+w*.4} ${y+h-2}H${x+w*.25}Z" fill="#fff" opacity=".12"/>`;
 if(gift)shape+=`<path d="M250 ${y}v${h}" stroke="${colorHex(label(product,values,'ribbon'))}" stroke-width="12"/><path d="M250 ${y+20}q-50 -40 -38 0q10 17 38 0q50 -40 38 0q-10 17 -38 0" fill="none" stroke="${colorHex(label(product,values,'ribbon'))}" stroke-width="8"/>`;
 if(face&&face.kind!=='none'){
 const b=printBounds(face,w,h,face.aspect||1.45),px=x+(b.x-b.w/2)*w,py=y+(1-b.y-b.h/2)*h,pw=b.w*w,ph=b.h*h;
 shape+=image?`<image href="${escape(image)}" x="${px}" y="${py}" width="${pw}" height="${ph}" preserveAspectRatio="xMidYMid meet"/>`:`<g text-anchor="middle" dominant-baseline="middle" font-size="${ph*.47}" fill="${ink}" font-family="Georgia,serif"><text x="${px+pw/2}" y="${py+ph*.29}">Twoja</text><text x="${px+pw/2}" y="${py+ph*.78}" font-style="italic">marka.</text></g>`;
 }
 if(guides)shape+=`<rect x="${x+w*.14}" y="${y+h*.24}" width="${w*.72}" height="${h*.56}" fill="none" stroke="#406e5c" opacity=".45" stroke-dasharray="4 4"/>`;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 560" role="img" aria-label="${escape(product.name)} — widok na wprost"><ellipse cx="250" cy="${y+h+22}" rx="${w*.48}" ry="10" fill="#163e34" opacity=".06"/>${shape}<g fill="#577366" font-family="Arial,sans-serif" font-size="12"><path d="M${x} 475v10m0-5h${w}m0-5v10" fill="none" stroke="#9caf9f"/><text x="250" y="502" text-anchor="middle">${dim.width} cm · szerokość</text><text x="250" y="526" text-anchor="middle">${escape(dim.label)} · format produktu</text></g></svg>`;
}

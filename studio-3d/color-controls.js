const channels=['r','g','b'];
const toHex=rgb=>'#'+rgb.map(n=>n.toString(16).padStart(2,'0')).join('');
const fromHex=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
function customColor(hex){
  const rgb=fromHex(hex);
  const linear=rgb.map(n=>{const c=n/255;return c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4);});
  const luminance=linear[0]*.2126+linear[1]*.7152+linear[2]*.0722;
  return {name:'Własny '+hex.toUpperCase(),body:hex,inside:toHex(rgb.map(n=>Math.round(n*.8))),ink:luminance>.35?'#194f3b':'#f1edda'};
}
export function initColorControls({palette,onChange}){
  const $=s=>document.querySelector(s),picker=$('#bag-color'),hexField=$('#bag-hex'),rgbFields=channels.map(c=>$('#bag-'+c)),error=$('#color-error');
  let current=palette.green;
  function clearError(){error.textContent='';[hexField,...rgbFields].forEach(el=>el.removeAttribute('aria-invalid'));}
  function sync(preset=null){
    const hex=current.body.toUpperCase(),rgb=fromHex(hex);
    picker.value=hex.toLowerCase();hexField.value=hex;rgbFields.forEach((el,i)=>el.value=rgb[i]);
    $('#color-label').textContent=current.name;
    document.querySelectorAll('[data-color]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.color===preset)));
    clearError();
  }
  function apply(hex,preset=null,editing=null){
    const value=editing?.value;
    current=preset?palette[preset]:customColor(hex.toLowerCase());sync(preset);
    if(editing)editing.value=value;
    onChange(current);
  }
  function invalid(input,message){input.setAttribute('aria-invalid','true');error.textContent=message;}
  picker.addEventListener('input',()=>apply(picker.value));
  document.querySelectorAll('[data-color]').forEach(b=>b.addEventListener('click',()=>apply(palette[b.dataset.color].body,b.dataset.color)));
  function readHex(){
    let hex=hexField.value.trim().replace(/^#/,'');
    if(!/^(?:[\da-f]{3}|[\da-f]{6})$/i.test(hex))return false;
    if(hex.length===3)hex=[...hex].map(c=>c+c).join('');return '#'+hex;
  }
  hexField.addEventListener('input',()=>{const hex=readHex();if(hex)apply(hex,null,hexField);else clearError();});
  const commitHex=()=>{const hex=readHex();if(hex)apply(hex);else invalid(hexField,'Wpisz kolor HEX, np. #246BFD.');};
  hexField.addEventListener('change',commitHex);hexField.addEventListener('blur',commitHex);
  for(const field of rgbFields){
    field.addEventListener('input',()=>{
      const rgb=rgbFields.map(el=>el.value.trim());
      if(rgb.every(v=>/^\d{1,3}$/.test(v)&&Number(v)<=255))apply(toHex(rgb.map(Number)),null,field);
      else if(field.value!==''&&(Number(field.value)<0||Number(field.value)>255||!Number.isInteger(Number(field.value))))invalid(field,'Każdy kanał RGB musi mieć wartość od 0 do 255.');
    });
    const validateChannel=()=>{
      if(field.value===''||!Number.isInteger(Number(field.value))||Number(field.value)<0||Number(field.value)>255)invalid(field,'Każdy kanał RGB musi mieć wartość od 0 do 255.');
    };
    field.addEventListener('change',validateChannel);field.addEventListener('blur',validateChannel);
  }
  sync('green');
}

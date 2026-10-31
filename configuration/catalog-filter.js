const fold=s=>String(s).toLocaleLowerCase('pl').normalize('NFD').replace(/[\u0300-\u036f\s]/g,'').replaceAll('ł','l').replaceAll('×','x');
export function matchesProduct(p,{family='',query='',color='',size='',handle=''}={}){
 if(family&&p.family!==family&&p.category!==family)return false;
 if(handle&&!String(p.specs.Uchwyt||'').includes(handle))return false;
 if(query&&!fold([p.name,p.size,...Object.values(p.specs),...p.fields.flatMap(f=>f.options.map(o=>o.label))].join(' ')).includes(fold(query)))return false;
 const selected={...(color?{stockColor:color}:{}),...(size?{size}:{})};
 if(p.variantMatrix)return p.variantMatrix.some(v=>Object.entries(selected).every(([key,value])=>v[key]===value));
 return Object.entries(selected).every(([key,value])=>p.fields.find(f=>f.id===key)?.options.some(o=>o.id===value));
}

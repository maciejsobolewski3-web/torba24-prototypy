const params=new URLSearchParams(location.search);
let saved=false;try{saved=!!localStorage.getItem('printbag24-project');}catch{}
if(params.has('cart')||params.get('restore')==='1'||(saved&&!params.has('product')&&!params.has('upload'))){import('../app.js?v=qa-41');}
else{const target=new URL('../studio-3d/',import.meta.url);target.searchParams.set('id',params.get('product')||'premium');if(params.has('quantity'))target.searchParams.set('quantity',params.get('quantity'));if(params.has('upload'))target.searchParams.set('panel','artwork');location.replace(target.href);}

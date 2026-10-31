import {get,list,addToCart,id,price,money,validQuantity,esc} from '../order/store.js?v=catalog-22';
export async function initOrderBridge(studio){
  const $=s=>document.querySelector(s),params=new URLSearchParams(location.search);
  const projectId=params.get('project')||id(),quantity=$('#order-quantity'),button=$('#review-project'),status=$('#studio-status');
  let ready=false;
  const variantButton=$('#add-variant'),variants=await list('cart'),others=variants.filter(p=>p.id!==projectId);
  button.textContent=others.length?`Wyceń torby (${others.length+1})`:'Wyceń tę torbę';
  $('#variant-note').textContent=others.length?`W zapytaniu uwzględnimy też ${others.length} zapisane warianty. Możesz je sprawdzić w koszyku.`:'Jeden projekt? Przejdź od razu do danych kontaktowych.';
  const update=()=>{
    const p={...studio.details(),quantity:Number(quantity.value)};
    if(p.configuration){const box=$('.order-config');box.querySelector('.studio-eyebrow').textContent=p.configuration.productName;box.querySelector('strong').textContent=p.configuration.dimensions.label;box.querySelector('small').textContent='Minimalny nakład potwierdzimy przy wycenie.';}
    $('#studio-summary-details').innerHTML=p.configuration?Object.values(p.configuration.options).map(o=>`<div><dt>${esc(o.label)}</dt><dd>${esc(o.display)}</dd></div>`).join('')+(p.configuration.requests||[]).map(o=>`<div><dt>Na zamówienie</dt><dd>${esc(o.value)}</dd></div>`).join(''):'';
    const result=validQuantity(p.quantity,p)?price(p):null;
    $('#order-price').textContent=!validQuantity(p.quantity,p)?(p.configuration?'Wpisz nakład od 1 do 100 000 szt.':'Wpisz nakład od 50 do 10 000 szt.'):result?money(result.total):'Indywidualna wycena';
    $('#order-price-note').textContent=result?`${money(result.unit)} / szt. · szacunkowo brutto`:'Parametry, cena i termin wymagają potwierdzenia przy wycenie.';
  };
  if(params.has('project')){
    try{
      const project=await get(params.get('from')==='cart'?'cart':'projects',projectId);
      if(!project)throw new Error('missing');
      await studio.restore(project);quantity.value=project.quantity;ready=true;
    }catch{
      status.textContent='Nie można odczytać zapisanego projektu. Wróć do koszyka lub otwórz nowe studio. Nie nadpisaliśmy Twojej torby.';
      button.disabled=true;variantButton.disabled=true;return;
    }
  }else{quantity.value=validQuantity(params.get('quantity'),studio.details())?params.get('quantity'):100;ready=true;}
  if(studio.details().configuration){quantity.min=1;quantity.max=100000;}
  update();quantity.addEventListener('input',update);
  window.addEventListener('pageshow',event=>{if(event.persisted&&ready){document.querySelector('.studio-layout').inert=false;button.disabled=false;status.textContent='Możesz kontynuować edycję projektu.';}});
  document.addEventListener('studio-project-change',update);
  // Changes to the second print can affect the illustrative unit price.
  document.querySelector('.studio-panel').addEventListener('click',()=>setTimeout(update,0));
  async function proceed(addVariant=false){
    if(!ready||!quantity.reportValidity())return;
    const invalid=document.querySelector('.custom-color [aria-invalid=true]');
    if(invalid){invalid.focus();status.textContent='Popraw kolor przed przejściem dalej.';return;}
    button.disabled=true;document.querySelector('.studio-layout').inert=true;status.textContent='Zapisuję projekt i podglądy obu stron…';
    try{
      const project={...await studio.snapshot(),id:projectId,quantity:Number(quantity.value),updatedAt:Date.now()};
      await addToCart(project);
      location.href=addVariant?'../catalog/':'../order/?step=quote';
    }catch{
      status.textContent='Nie udało się zapisać projektu w przeglądarce. Sprawdź wolne miejsce i dostęp do pamięci witryny. Twój projekt nadal jest w studiu.';
      button.disabled=false;document.querySelector('.studio-layout').inert=false;
    }
  }
  button.addEventListener('click',()=>proceed());
  variantButton.addEventListener('click',()=>proceed(true));
}

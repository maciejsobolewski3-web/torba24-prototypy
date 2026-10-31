import {get,put,id,price,money,validQuantity} from '../order/store.js?v=catalog-22';
export async function initOrderBridge(studio){
  const $=s=>document.querySelector(s),params=new URLSearchParams(location.search);
  const projectId=params.get('project')||id(),quantity=$('#order-quantity'),button=$('#review-project'),status=$('#studio-status');
  let ready=false;
  const update=()=>{
    const p={...studio.details(),quantity:Number(quantity.value)};
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
      button.disabled=true;return;
    }
  }else{quantity.value=validQuantity(params.get('quantity'),studio.details())?params.get('quantity'):100;ready=true;}
  const config=studio.details().configuration;
  if(config){quantity.min=1;quantity.max=100000;const box=$('.order-config');box.querySelector('.studio-eyebrow').textContent=config.productName;box.querySelector('strong').textContent=config.dimensions.label;box.querySelector('small').textContent='Minimalny nakład potwierdzimy przy wycenie.';const change=document.createElement('button');change.type='button';change.className='quiet-button';change.textContent='Zmień format, sznurek i wykończenie';change.addEventListener('click',async()=>{if(!quantity.reportValidity())return;change.disabled=true;try{await put('projects',{...await studio.snapshot(),id:projectId,quantity:Number(quantity.value),updatedAt:Date.now()});location.href=`../configuration/?project=${projectId}`;}catch{status.textContent='Nie udało się zapisać projektu.';change.disabled=false;}});box.prepend(change);}
  update();quantity.addEventListener('input',update);
  window.addEventListener('pageshow',event=>{if(event.persisted&&ready){document.querySelector('.studio-layout').inert=false;button.disabled=false;status.textContent='Możesz kontynuować edycję projektu.';}});
  document.addEventListener('studio-project-change',update);
  // Changes to the second print can affect the illustrative unit price.
  document.querySelector('.studio-panel').addEventListener('click',()=>setTimeout(update,0));
  button.addEventListener('click',async()=>{
    if(!ready||!quantity.reportValidity())return;
    const invalid=document.querySelector('.custom-color [aria-invalid=true]');
    if(invalid){invalid.focus();status.textContent='Popraw kolor przed sprawdzeniem projektu.';return;}
    button.disabled=true;document.querySelector('.studio-layout').inert=true;status.textContent='Zapisuję projekt i podglądy obu stron…';
    try{
      const project={...await studio.snapshot(),id:projectId,quantity:Number(quantity.value),updatedAt:Date.now()};
      await put('projects',project);
      location.href=`../order/?step=review&project=${encodeURIComponent(projectId)}`;
    }catch{
      status.textContent='Nie udało się zapisać projektu w przeglądarce. Sprawdź wolne miejsce i dostęp do pamięci witryny. Twój projekt nadal jest w studiu.';
      button.disabled=false;document.querySelector('.studio-layout').inert=false;
    }
  });
}

// Shared presentation and form rules; production minimums come from the merchant.
export function validOrderQuantity(value){const n=Number(value);return String(value).trim()!==''&&Number.isInteger(n)&&n>=1&&n<=100000;}
export function polishCount(n,one,few,many){return `${n} ${n===1?one:n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?few:many}`;}
export function formatDimensions(value){return String(value).replace(/(\d)\.(?=\d)/g,'$1,').replace(/\s*[x×]\s*/g,' × ');}
export function contactModel(id,products,aliases){return products.find(p=>p.id===id)?.id||products.find(p=>p.id===aliases[id])?.id||'';}
export function bindQuantity(input){
 const error=document.createElement('p');error.className='field-error';error.id=(input.id||'quantity-'+input.dataset.quantityInput)+'-error';error.setAttribute('aria-live','polite');(input.closest('.stepper')||input).after(error);
 input.min=1;input.max=100000;input.step=1;input.required=true;input.setAttribute('aria-describedby',error.id);
 const check=()=>{const ok=validOrderQuantity(input.value);input.setAttribute('aria-invalid',String(!ok));error.textContent=ok?'':'Wpisz pełną liczbę od 1 do 100 000 szt.';input.setCustomValidity(ok?'':'Wpisz pełną liczbę od 1 do 100 000 szt.');return ok;};
 input.addEventListener('input',check);input.addEventListener('change',check);return check;
}

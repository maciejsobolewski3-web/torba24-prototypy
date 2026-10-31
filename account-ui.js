const userIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></svg>';
export function accountButton(){return `<button type="button" class="account-trigger" data-account-open aria-haspopup="dialog" aria-label="Zaloguj się">${userIcon}<span>Zaloguj się</span></button>`;}
export function initAccountUI(){
 if(document.querySelector('#account-dialog'))return;
 const dialog=document.createElement('dialog');
 dialog.id='account-dialog';dialog.className='account-dialog';dialog.setAttribute('aria-labelledby','account-heading');
 document.body.append(dialog);
 let mode='login',opener;
 const titles={login:'Zaloguj się',register:'Utwórz konto',reset:'Zresetuj hasło'};
 const subtitles={login:'Wróć do swoich projektów i zamówień.',register:'Zachowaj projekty i wygodnie wracaj do zamówień.',reset:'Podaj adres e-mail przypisany do Twojego konta.'};
 function render(){
  dialog.innerHTML=`<button type="button" class="account-close" data-account-close aria-label="Zamknij logowanie"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg></button><span class="account-eyebrow">TWOJE KONTO / PRINTBAG24</span><h2 id="account-heading" tabindex="-1">${titles[mode]}</h2><p class="account-intro">${subtitles[mode]}</p>${mode!=='reset'?`<div class="account-tabs" role="group" aria-label="Dostęp do konta"><button type="button" data-account-view="login" aria-pressed="${mode==='login'}">Logowanie</button><button type="button" data-account-view="register" aria-pressed="${mode==='register'}">Rejestracja</button></div>`:''}<form class="account-form"><label for="account-email">Adres e-mail</label><input id="account-email" name="email" type="email" autocomplete="${mode==='login'?'username':'email'}" placeholder="twoj@email.pl" required maxlength="254">${mode!=='reset'?`<label for="account-password">Hasło</label><div class="account-password"><input id="account-password" name="password" type="password" autocomplete="${mode==='register'?'new-password':'current-password'}" ${mode==='register'?'minlength="8" aria-describedby="account-password-hint"':''} required maxlength="128"><button type="button" data-account-password aria-controls="account-password" aria-pressed="false">Pokaż</button></div>${mode==='register'?`<small id="account-password-hint">Co najmniej 8 znaków.</small><label for="account-confirm">Powtórz hasło</label><input id="account-confirm" name="confirm" type="password" autocomplete="new-password" required maxlength="128">`:`<button type="button" class="account-forgot" data-account-view="reset">Nie pamiętasz hasła?</button>`}`:''}<p class="account-status" id="account-status" role="status" hidden></p><button type="submit" class="account-submit">${mode==='login'?'Zaloguj się':mode==='register'?'Utwórz konto':'Wyślij link do zmiany hasła'}</button></form>${mode==='reset'?'<button type="button" class="account-back" data-account-view="login">Wróć do logowania</button>':'<p class="account-privacy">Informacje o przetwarzaniu danych znajdziesz w <a href="https://zamowdruk.pl/polityka-prywatnosci" target="_blank" rel="noopener">polityce prywatności</a>.</p>'}`;
 }
 function close(){dialog.close();}
 document.addEventListener('click',event=>{
  const trigger=event.target.closest('[data-account-open]');if(!trigger)return;
  opener=trigger;mode='login';document.querySelector('#modal[open]')?.close();render();
  dialog.showModal();document.body.classList.add('account-is-open');dialog.querySelector('#account-email').focus({preventScroll:true});
 });
 dialog.addEventListener('click',event=>{
  if(event.target.closest('[data-account-close]'))return close();
  const view=event.target.closest('[data-account-view]');
  if(view){mode=view.dataset.accountView;render();dialog.querySelector('#account-heading').focus({preventScroll:true});return;}
  const toggle=event.target.closest('[data-account-password]');
  if(toggle){const input=dialog.querySelector('#account-password');const show=input.type==='password';input.type=show?'text':'password';toggle.textContent=show?'Ukryj':'Pokaż';toggle.setAttribute('aria-pressed',String(show));}
  if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();}
 });
 dialog.addEventListener('input',()=>{dialog.querySelector('#account-confirm')?.setCustomValidity('');});
 dialog.addEventListener('submit',event=>{
  event.preventDefault();
  const confirm=dialog.querySelector('#account-confirm');
  if(confirm&&confirm.value!==dialog.querySelector('#account-password').value){confirm.setCustomValidity('Hasła muszą być takie same.');confirm.reportValidity();return;}
  // UI only: never persist or send credentials until an authentication service is connected.
  const status=dialog.querySelector('#account-status');status.hidden=false;
  status.textContent={login:'Logowanie nie jest jeszcze uruchomione. W sprawie zamówienia skontaktuj się z nami: info@easolution.pl.',register:'Rejestracja kont nie jest jeszcze uruchomiona. Nadal możesz przygotować projekt bez konta.',reset:'Odzyskiwanie hasła nie jest jeszcze uruchomione. Potrzebujesz pomocy? Napisz na info@easolution.pl.'}[mode];
  dialog.querySelectorAll('input[type="password"],#account-password').forEach(input=>input.value='');
 });
 dialog.addEventListener('close',()=>{document.body.classList.remove('account-is-open');dialog.innerHTML='';if(opener?.isConnected&&opener.getClientRects().length)opener.focus({preventScroll:true});});
}

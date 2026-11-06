document.addEventListener('DOMContentLoaded',()=>{
 if(new URLSearchParams(location.search).has('stream'))return;
 const compact=document.querySelector('#streamCardBtn');if(!compact)return;
 const button=document.createElement('button');button.type='button';button.className='btn';button.id='translatorBtn';button.textContent='Translator';button.title='Open Korean ↔ English translator';
 button.addEventListener('click',()=>{const popup=window.open('translator.html','trackwhales-translator','popup,width=520,height=760,resizable=yes,scrollbars=yes');if(popup)popup.focus();else window.location.assign('translator.html');});compact.after(button);
 const secondary=document.querySelector('#livePop');if(secondary){const twin=button.cloneNode(true);twin.id='liveTranslator';twin.addEventListener('click',()=>button.click());secondary.after(twin);}
});

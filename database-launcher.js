document.addEventListener('DOMContentLoaded',()=>{
 if(new URLSearchParams(location.search).has('stream'))return;
 function launch(){const popup=window.open('database.html','trackwhales-database','popup,width=1120,height=850,resizable=yes,scrollbars=yes');if(popup)popup.focus();else location.assign('database.html');}
 for(const [selector,id] of [['#translatorBtn','databaseBtn'],['#liveTranslator','liveDatabase']]){const previous=document.querySelector(selector);if(!previous)continue;const button=document.createElement('button');button.id=id;button.type='button';button.className='btn';button.textContent='Database';button.title='Browse Classic World data and training maps';button.addEventListener('click',launch);previous.after(button);}
});

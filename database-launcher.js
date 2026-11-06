document.addEventListener('DOMContentLoaded',()=>{
 if(new URLSearchParams(location.search).has('stream'))return;
 function launch(){const frame=document.querySelector('#databaseFrame');if(!frame)return;if(!frame.getAttribute('src'))frame.src=frame.dataset.src;window.TrackwhalesWindows?.open('window-database');}
 for(const [selector,id] of [['#translatorBtn','databaseBtn'],['#liveTranslator','liveDatabase']]){const previous=document.querySelector(selector);if(!previous)continue;const button=document.createElement('button');button.id=id;button.type='button';button.className='btn';button.textContent='Database';button.title='Browse Classic World data and training maps';button.setAttribute('aria-controls','window-database');button.setAttribute('aria-expanded','false');button.dataset.openWindow='window-database';button.addEventListener('click',launch);previous.after(button);}
});

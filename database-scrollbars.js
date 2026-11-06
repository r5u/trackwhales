/* Visible, theme-driven scrollbars independent of the browser's native widgets. */
(()=>{'use strict';
const targets=[document.scrollingElement,...document.querySelectorAll('.results,#details,#training,#categories')].filter(Boolean);
let queued=false,dragging=null;
const bars=[];
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;for(const bar of bars)update(bar);});}
function metrics(bar){const e=bar.target,root=e===document.scrollingElement,horizontal=bar.horizontal,r=root?{left:0,top:0,right:innerWidth,bottom:innerHeight,width:innerWidth,height:innerHeight}:e.getBoundingClientRect();const view=horizontal?(root?innerWidth:e.clientWidth):(root?innerHeight:e.clientHeight),total=horizontal?e.scrollWidth:e.scrollHeight,offset=horizontal?e.scrollLeft:e.scrollTop;return {r,view,total,offset,max:Math.max(0,total-view)};}
function update(bar){const m=metrics(bar),{r}=m,h=bar.horizontal;const visible=m.max>1&&r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth;bar.rail.hidden=!visible;if(!visible)return;
 const start=h?Math.max(0,r.left):Math.max(0,r.top),end=h?Math.min(innerWidth,r.right):Math.min(innerHeight,r.bottom),length=Math.max(0,end-start-4);bar.length=length;bar.thumbLength=Math.min(length,Math.max(28,length*m.view/m.total));
 Object.assign(bar.rail.style,h?{left:start+2+'px',top:Math.min(innerHeight-12,r.bottom-12)+'px',width:length+'px'}:{top:start+2+'px',left:Math.min(innerWidth-12,r.right-12)+'px',height:length+'px'});
 const position=m.max?m.offset/m.max*(length-bar.thumbLength):0;Object.assign(bar.thumb.style,h?{width:bar.thumbLength+'px',left:position+'px'}:{height:bar.thumbLength+'px',top:position+'px'});bar.rail.setAttribute('aria-valuemax',String(Math.round(m.max)));bar.rail.setAttribute('aria-valuenow',String(Math.round(m.offset)));
}
function set(bar,offset){const max=metrics(bar).max;bar.target[bar.horizontal?'scrollLeft':'scrollTop']=Math.max(0,Math.min(max,offset));schedule();}
for(const [index,target] of targets.entries()){
 target.dataset.dbScrollbar='true';if(!target.id)target.id='db-scroll-region-'+index;
 for(const horizontal of [false,true]){
  const rail=document.createElement('div'),thumb=document.createElement('div');rail.className='db-scrollbar '+(horizontal?'horizontal':'vertical');thumb.className='db-scroll-thumb';rail.append(thumb);rail.hidden=true;rail.tabIndex=0;rail.setAttribute('role','scrollbar');rail.setAttribute('aria-controls',target.id);rail.setAttribute('aria-orientation',horizontal?'horizontal':'vertical');rail.setAttribute('aria-valuemin','0');rail.setAttribute('aria-label',(target.matches('.results')?'Database results':target.id==='details'?'Entry details':target.id==='training'?'Training suggestions':target.id==='categories'?'Database categories':'Database page')+' '+(horizontal?'horizontal':'vertical')+' scroll');document.body.append(rail);
  const bar={rail,thumb,target,horizontal,length:0,thumbLength:0};bars.push(bar);
  rail.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();rail.focus({preventScroll:true});update(bar);const m=metrics(bar),coordinate=horizontal?e.clientX:e.clientY;if(e.target!==thumb){const r=rail.getBoundingClientRect(),start=horizontal?r.left:r.top;set(bar,(coordinate-start-bar.thumbLength/2)/Math.max(1,bar.length-bar.thumbLength)*m.max);}dragging={bar,coordinate,offset:horizontal?target.scrollLeft:target.scrollTop};rail.setPointerCapture(e.pointerId);});
  rail.addEventListener('pointermove',e=>{if(dragging?.bar!==bar)return;const delta=(horizontal?e.clientX:e.clientY)-dragging.coordinate;set(bar,dragging.offset+delta/Math.max(1,bar.length-bar.thumbLength)*metrics(bar).max);});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])rail.addEventListener(event,()=>{if(dragging?.bar===bar)dragging=null;});
  rail.addEventListener('keydown',e=>{const m=metrics(bar),changes={ArrowDown:40,ArrowRight:40,ArrowUp:-40,ArrowLeft:-40,PageDown:m.view*.9,PageUp:-m.view*.9};if(e.key==='Home'){e.preventDefault();set(bar,0);}else if(e.key==='End'){e.preventDefault();set(bar,m.max);}else if(e.key in changes){e.preventDefault();set(bar,m.offset+changes[e.key]);}});
  rail.addEventListener('wheel',e=>{e.preventDefault();const delta=horizontal?(e.deltaX||e.deltaY):e.deltaY;set(bar,metrics(bar).offset+delta*(e.deltaMode===1?16:e.deltaMode===2?metrics(bar).view:1));},{passive:false});
 }
}
const resize=new ResizeObserver(schedule);for(const target of targets)resize.observe(target);
const mutations=new MutationObserver(schedule);mutations.observe(document.querySelector('main'),{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden','open','class','style']});
document.addEventListener('scroll',schedule,true);document.addEventListener('load',schedule,true);addEventListener('resize',schedule);schedule();
})();

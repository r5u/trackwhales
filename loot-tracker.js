(()=>{
'use strict';
const KEY='trackwhales-loot-v1',catalog=window.MapleEtcCatalog;let data;
try{data=JSON.parse(localStorage.getItem(KEY))}catch{}
if(!data||!Array.isArray(data.events))data={events:[],prices:{},seen:[],since:Date.now()};
data.prices=data.prices||{};data.seen=data.seen||[];
const q=id=>document.getElementById(id),save=()=>{try{localStorage.setItem(KEY,JSON.stringify(data))}catch{}};
const canonical=name=>catalog?.find(name)?.name||name;
function priceFor(name){const match=catalog?.find(name);const key=Object.keys(data.prices).find(k=>(catalog?.normalize(k)||k)===(catalog?.normalize(name)||name));const override=key!==undefined?data.prices[key]:undefined;const manual=Number.isSafeInteger(override)&&override>=0;return{price:manual?override:match?.price,manual,match};}
function element(tag,text){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;}
function clearOverride(name){for(const k of Object.keys(data.prices))if((catalog?.normalize(k)||k)===(catalog?.normalize(name)||name))delete data.prices[k];}
function render(){
 const body=q('lootRows');if(!body||body.contains(document.activeElement))return;
 const grouped=new Map();for(const e of data.events){const name=canonical(e.name);const item=grouped.get(name)||{name,quantity:0};item.quantity+=e.quantity;grouped.set(name,item)}
 let total=0,unpriced=0,count=0;body.replaceChildren();
 for(const item of grouped.values()){
  count+=item.quantity;const info=priceFor(item.name),price=info.price,priced=Number.isSafeInteger(price)&&price>=0;
  if(priced)total+=price*item.quantity;else unpriced+=item.quantity;
  const row=element('tr'),name=element('td');
  if(info.match&&!info.match.ambiguous){const link=element('a',item.name);link.href=info.match.url;link.target='_blank';link.rel='noopener noreferrer';name.append(link)}else name.textContent=item.name;
  const source=element('small',info.manual?'Manual override':info.match?.ambiguous?'Multiple MeowDB matches':priced?'MeowDB · NPC sell-back':info.match?'MeowDB · price unavailable':'No ETC match');source.className='loot-price-source';name.append(source);
  const qty=element('td',item.quantity.toLocaleString()),cell=element('td'),input=element('input');input.type='number';input.min='0';input.step='1';input.placeholder='Unpriced';input.value=priced?price:'';input.setAttribute('aria-label','NPC sell price for '+item.name);input.title=info.manual?'Manual override. Clear to restore the MeowDB price.':'MeowDB NPC sell-back price. Edit to override.';
  input.addEventListener('input',()=>input.setCustomValidity(''));
  input.addEventListener('change',()=>{const n=Number(input.value);if(input.value.trim()!==''){if(!Number.isSafeInteger(n)||n<0){input.setCustomValidity('Enter a whole number of mesos, zero or more.');input.reportValidity();return}clearOverride(item.name);data.prices[item.name]=n}else clearOverride(item.name);save();input.blur();render()});
  cell.append(input);const value=element('td',priced?(price*item.quantity).toLocaleString():'—');row.append(name,qty,cell,value);body.append(row);
 }
 q('lootCount').textContent=count.toLocaleString();q('lootTotal').textContent=total.toLocaleString();const elapsed=Date.now()-data.since;
 q('lootRate').textContent=count&&elapsed>=60000?Math.round(total*3600000/elapsed).toLocaleString():'—';q('lootUnpriced').textContent=unpriced?unpriced.toLocaleString()+' items need a sell price':'All items priced';q('lootEmpty').hidden=grouped.size>0;
}
window.TrackwhalesLoot={update(state){
 if(!q('lootRows'))return;let changed=false;
 for(const n of state.dropNotices||[]){const id=JSON.stringify([n.t,n.text,n.map]);if(data.seen.includes(id))continue;data.seen.push(id);changed=true;if(n.t<data.since)continue;const m=n.text.match(/^(.+?) x(\d+) \(([^)]+)\)$/);if(!m)continue;const quantity=Number(m[2]);if(!Number.isSafeInteger(quantity)||quantity<1)continue;data.events.push({name:canonical(m[1].trim()),quantity,t:n.t})}
 if(changed){data.seen=data.seen.slice(-1000);save()}render();
}};
document.addEventListener('DOMContentLoaded',()=>{
 if(!q('lootForm'))return;
 const list=q('lootItemNames');if(list&&catalog){for(const name of [...new Set(catalog.items.map(i=>i.name))].sort()){const option=element('option');option.value=name;list.append(option)}}
 const hint=()=>{const info=priceFor(q('lootName').value.trim());q('lootPrice').placeholder=Number.isSafeInteger(info.price)?'Auto: '+info.price.toLocaleString()+' mesos':'Mesos / item';};q('lootName').addEventListener('input',hint);
 q('lootForm').addEventListener('submit',e=>{e.preventDefault();const name=canonical(q('lootName').value.trim()),quantity=Number(q('lootQty').value),raw=q('lootPrice').value,price=Number(raw);if(!name||!Number.isSafeInteger(quantity)||quantity<1||raw!==''&&(!Number.isSafeInteger(price)||price<0))return;if(raw!==''){clearOverride(name);data.prices[name]=price}data.events.push({name,quantity,t:Date.now()});save();q('lootForm').reset();q('lootQty').value=1;hint();render()});
 q('lootReset').addEventListener('click',()=>{if(!confirm('Clear tracked drops? Your sell prices will be kept.'))return;data.events=[];data.since=Date.now();save();render()});render();
});
})();
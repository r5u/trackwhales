(()=>{'use strict';
let manifestPromise;const cache=new Map();
const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
const safe=url=>typeof url==='string'&&/^https:\/\/(?:www\.)?meowdb\.com\//.test(url);
const normal=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
async function load(mob){
 if(!manifestPromise)manifestPromise=fetch('meowdb-drops-index.json?v=20261111-1').then(r=>{if(!r.ok)throw Error('Drop snapshot unavailable');return r.json()}).catch(e=>{manifestPromise=null;throw e});
 const manifest=await manifestPromise;const found=manifest.monsters?.[String(mob.id)]||Object.values(manifest.monsters||{}).find(r=>normal(r.name)===normal(mob.name));
 if(!found)return{manifest,record:null};
 if(!cache.has(found.file))cache.set(found.file,fetch(found.file).then(r=>{if(!r.ok)throw Error('Drop records unavailable');return r.json()}).catch(e=>{cache.delete(found.file);throw e}));
 const payload=await cache.get(found.file),rows=Array.isArray(payload)?payload:payload.monsters||[];return{manifest,record:rows.find(r=>String(r.id)===String(mob.id)||normal(r.name)===normal(mob.name))};
}
function table(parent,title,rows,reference,options){if(!rows?.length)return;parent.append(el('h3',title));const table=el('table',undefined,'mob-drop-table'),head=el('tr');head.append(el('th','Item'),el('th',reference?'Reference chance':'Drop chance'));const thead=el('thead');thead.append(head);table.append(thead);const body=el('tbody');
 for(const row of rows){const tr=el('tr'),name=el('td');if(options.onItem){const b=el('button',row.name);b.type='button';b.className='drop-item-link';b.onclick=()=>options.onItem(row);name.append(b);}else if(safe(row.url)){const a=el('a',row.name);a.href=row.url;a.target='_blank';a.rel='noopener';name.append(a);}else name.textContent=row.name;
 const value=Number(row.rate_percent),known=row.rate_percent!==null&&row.rate_percent!==undefined&&Number.isFinite(value)&&value>=0&&value<=100;const rate=el('td',known?Number(value.toPrecision(6)).toLocaleString('en-US',{maximumFractionDigits:8})+'%':'Not published');if(known&&value>0){const small=el('small','≈ 1 in '+(100/value).toLocaleString('en-US',{maximumFractionDigits:1}));rate.append(small);}tr.append(name,rate);body.append(tr);}table.append(body);parent.append(table);
}
window.TrackwhalesDrops={async render(parent,mob,options={}){parent.replaceChildren(el('p','Loading MeowDB drops…','drop-note'));try{const {manifest,record}=await load(mob);if(!parent.isConnected)return;parent.replaceChildren();if(!record){parent.append(el('p','No MeowDB drop snapshot for this monster.','drop-note'));return;}if(record.community?.length)table(parent,'Classic World · community reported',record.community,false,options);
 if(record.reference?.length){parent.append(el('p','MeowDB labels these as historical OSMLib reference drops. Rates and items are not confirmed for Classic World.','drop-note'));table(parent,'Historical reference · via MeowDB',record.reference,true,options);}
 if(!record.community?.length&&!record.reference?.length)parent.append(el('p',record.availability==='unavailable'?'MeowDB page unavailable when this snapshot was collected.':'No published drop items in the saved MeowDB record.','drop-note'));
 if(safe(record.url)){const a=el('a','View '+mob.name+' on MeowDB ↗');a.href=record.url;a.target='_blank';a.rel='noopener';parent.append(a);}parent.append(el('small','Snapshot checked '+(record.checked||manifest.checked||'2026-11-11')+' · unpublished chances remain unknown.','drop-note'));
 }catch(e){if(parent.isConnected)parent.replaceChildren(el('p','Drop information could not load. Reopen this section to try again.','drop-note'));return false;}}
};
})();

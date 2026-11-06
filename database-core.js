(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TrackwhalesDatabase=api;})(typeof window==='undefined'?globalThis:window,()=>{
 'use strict';
 const level=row=>Number(row.level??row.level_min??row.stats?.reqLevel??row.req_skill_level??0);
 function recommend(maps,monsters,playerLevel,party=false){
  const player=Number(playerLevel);if(!Number.isInteger(player)||player<1||player>200)return [];
  const index=new Map(monsters.map(m=>[m.id,m]));const ranked=[];
  for(const map of maps){
   if(map.is_town||!['Victoria Island','Maple Island'].includes(map.region)||/test|tutorial|party quest|event|boss|forgotten hollow/i.test([map.name,map.street_name,map.region].join(' ')))continue;
   const points=map.mobs||[];if(!points.length)continue;
   const groups=new Map();for(const point of points){const mob=index.get(point.mob_id);if(!mob||mob.is_boss||mob.invincible||!mob.hp||!mob.exp||mob.id>=54&&mob.id<=63||mob.id===700003||/^(GM |Test\(|Tutorial)/i.test(mob.name))continue;groups.set(mob.id,{mob,count:(groups.get(mob.id)?.count||0)+1});}
   const rows=[...groups.values()];const count=rows.reduce((s,r)=>s+r.count,0);if(!count||count<points.length*.8)continue;
   const avg=key=>rows.reduce((s,r)=>s+r.mob[key]*r.count,0)/count;
   const mobLevel=avg('level');if(mobLevel<Math.max(1,player-14)||rows.some(r=>r.mob.level>player+(party?8:3)))continue;
   if(party&&count<12)continue;
   const fit=Math.exp(-Math.abs(mobLevel-(player+(party?2:-3)))/(party?8:6));
   const efficiency=rows.reduce((s,r)=>s+r.mob.exp/Math.pow(r.mob.hp,.65)*r.count,0)/count;
   const density=party?Math.min(count/6,12):Math.min(count,18);
   const score=fit*efficiency*Math.sqrt(density);
   ranked.push({map,score,level:mobLevel,hp:avg('hp'),exp:avg('exp'),count,perPlayer:count/(party?6:1),monsters:rows.sort((a,b)=>b.count-a.count)});
  }
  return ranked.sort((a,b)=>b.score-a.score||a.map.id-b.map.id).slice(0,6);
 }
 function search(rows,query){const words=String(query||'').toLowerCase().trim().split(/\s+/).filter(Boolean);return rows.filter(row=>words.every(w=>[row.name,row.id,row.item_id,row.region,row.street_name,row.category,row.sub_category,row.class_name,row.discipline,row.gender].filter(v=>v!==undefined).join(' ').toLowerCase().includes(w)));}
 return {level,recommend,search};
});

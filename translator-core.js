/* Browser adaptation of Lupin chat_text.py / outgoing_text.py.
 * Original: https://github.com/zhuffman68/lupin — see translator-credits.html. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TrackwhalesTranslation=api;})(typeof window==='undefined'?globalThis:window,()=>{
 'use strict';
 const hangul=/[\u1100-\u11ff\u3130-\u318f\uac00-\ud7a3]/;
 const clean=text=>String(text).normalize('NFC').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').replace(/\s+/g,' ').trim();
 const aliases={kpq:'Kerning City party quest',pq:'party quest',fm:'Free Market',wg:'Work Gloves',gfa:'Glove ATT scroll',gma:'Glove Magic ATT scroll'};
 function expand(text){return clean(text).replace(/\bLF(\d+)M\b/gi,'looking for $1 more party members').replace(/\bLFM\b/gi,'looking for party members').replace(/\bLFG\b/gi,'looking for a party').replace(/\bWTB\b|^B\s*>\s*/gi,'buying ').replace(/\bWTS\b|^S\s*>\s*/gi,'selling ').replace(/\b(?:ty|thx|tyvm)\b/gi,'thank you').replace(/\b(?:pls|plz)\b/gi,'please').replace(/\binv\s+me\b/gi,'please invite me').replace(/\b(?:pm|dm)\s+me\b/gi,'whisper me').replace(/\bea\b/gi,'each').replace(/\b(kpq|pq|fm|wg|gfa|gma)\b/gi,m=>aliases[m.toLowerCase()]).replace(/\s+/g,' ').trim();}
 function direct(text,direction,data){
  text=clean(text);const phrase=text.toLowerCase().replace(/[.!?]+$/,'');
  const social=direction==='en-ko'?data.writeSOCIAL:data.readSOCIAL;
  if(social?.[phrase])return social[phrase];
  if(direction==='en-ko'){
   const party=text.match(/^looking for\s*(?:(\d+)\s*(?:more\s*)?)?party members?(?:\s+(?:for\s+)?(Kerning City party quest|party quest))?[.!]?$/i);
   if(party)return (party[2]?.startsWith('Kerning')?'커닝 파퀘 ':party[2]?'파퀘 ':'')+'파티원'+(party[1]?' '+party[1]+'명':'')+' 구합니다.';
   const ch=text.match(/^(?:cc|change (?:to )?channel)\s*(\d+)[.!]?$/i);if(ch)return ch[1]+'채널로 이동해 주세요.';
   const trade=text.match(/^(buying|selling)\s+(.+)$/i);
   if(trade){
    let body=trade[2],remaining=body.replace(/\b(?:Work Gloves|Glove ATT scroll|Glove Magic ATT scroll)\b/gi,' ');
    const identified=remaining!==body;
    remaining=remaining.replace(/[-+]?\d+(?:,\d{3})*(?:\.\d+)?\s*(?:억|만|[kKmMbB])?\s*%?/g,' ');
    for(const [term] of data.writeTRADE_WORDS||[])remaining=remaining.replace(new RegExp('\\b'+term+'\\b','gi'),' ');
    remaining=remaining.replace(/\b(?:att|matt|str|dex|int|luk|hp|mp|clean|unscrolled|scrolled)\b/gi,' ');
    if(identified&&!/[\p{L}\p{N}?]/u.test(remaining)){
     for(const [term,value] of data.writeTRADE_WORDS||[])body=body.replace(new RegExp('\\b'+term+'\\b','gi'),value);
     return (trade[1].toLowerCase()==='buying'?'구매: ':'판매: ')+body;
    }
   }
  }else{
   const exact={안녕하세요:'hello',안녕:'hello',감사합니다:'thank you',고마워요:'thank you',죄송합니다:'sorry',미안해요:'sorry',자리요:'this spot is taken',팟점여:'please invite me',팟좀요:'please invite me',초대점여:'please invite me',초대좀요:'please invite me',파티구합니다:'looking for a party'};
   if(exact[text.replace(/[\s.!?]/g,'')])return exact[text.replace(/[\s.!?]/g,'')];
  }
  if(direction==='ko-en'){
   let gloss=text;for(const [pattern,replacement] of data.readGLOSSES||[])gloss=gloss.replace(new RegExp(pattern,'g'),replacement);
   if(gloss!==text&&!hangul.test(gloss))return gloss;
  }
  return null;
 }
 function numbers(text){return [...text.matchAll(/(?<![\dA-Za-z_.])([-+]?\d+(?:,\d{3})*(?:\.\d+)?)\s*(억|만|[kKmMbB](?![A-Za-z]))?/g)].map(m=>Number(m[1].replaceAll(',',''))*({억:1e8,만:1e4,k:1e3,m:1e6,b:1e9}[m[2]?.toLowerCase()]||1)).sort((a,b)=>a-b);}
 function validate(source,result){if(!result?.trim())throw Error('No translation returned. Try a shorter message.');const percentages=t=>[...t.matchAll(/(\d+(?:\.\d+)?)\s*(?:%|퍼센트|프로|percent\b)/gi)].map(m=>Number(m[1])).sort((a,b)=>a-b);const currencies=t=>['mesos','won','dollars'].filter((name,i)=>[/메소|\bmesos?\b/i,/원|\b(?:won|KRW)\b/i,/\$|\b(?:USD|dollars?)\b/i][i].test(t));if(JSON.stringify(numbers(source))!==JSON.stringify(numbers(result))||JSON.stringify(percentages(source))!==JSON.stringify(percentages(result))||JSON.stringify(currencies(source))!==JSON.stringify(currencies(result)))throw Error('The translation changed a number. Original kept—try a shorter message.');return result.trim();}
 return {clean,expand,direct,numbers,validate,hangul};
});

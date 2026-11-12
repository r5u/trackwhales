// Browser counterpart to Lupin 1.0.5's demand-driven OPUS translation worker.
// Korean reading uses the smaller language-pair model instead of loading NLLB.
const pipelines=new Map();
async function load(direction,id){
 const name=direction==='ko-en'?'Xenova/opus-mt-ko-en':'Xenova/nllb-200-distilled-600M';
 if(!pipelines.has(name))pipelines.set(name,(async()=>{
  postMessage({type:'progress',id,text:'Starting local translation runtime…'});
  const {pipeline,env}=await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/dist/transformers.min.js');
  env.allowLocalModels=false;env.backends.onnx.wasm.numThreads=1;
  const files=new Map();
  return pipeline('translation',name,{dtype:'q8',device:'wasm',progress_callback:p=>{
   if(p.status==='progress'){
    files.set(p.file||'model',{loaded:p.loaded||0,total:p.total||0});
    const loaded=[...files.values()].reduce((n,f)=>n+f.loaded,0);
    postMessage({type:'progress',id,text:'Downloaded '+(loaded/1048576).toFixed(1)+' MB · '+(p.file||'language model')+' '+Math.round(p.progress)+'%'});
   }
   else if(p.status==='done')postMessage({type:'progress',id,text:'Preparing '+(p.file||'language model')+'…'});
  }});
 })().catch(e=>{pipelines.delete(name);throw e}));
 return pipelines.get(name);
}
let busy=false;
self.onmessage=async({data})=>{
 if(busy){postMessage({type:'error',id:data.id,text:'The translator is busy. Try again.'});return;}busy=true;
 try{const pipe=await load(data.direction,data.id);postMessage({type:'progress',id:data.id,text:'Translating on your device…'});
 const options={max_new_tokens:128,repetition_penalty:1.15};
 if(data.direction==='en-ko')Object.assign(options,{src_lang:'eng_Latn',tgt_lang:'kor_Hang'});
 const result=await pipe(data.text,options);postMessage({type:'result',id:data.id,text:result[0].translation_text});}
 catch(e){postMessage({type:'error',id:data.id,text:'The local model could not load or translate. Check your connection, then retry. '+e.message});}
 finally{busy=false;}
};

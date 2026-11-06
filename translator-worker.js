// Local multilingual fallback for browsers without the built-in Translator API.
let pipelinePromise;
async function load(){
 if(!pipelinePromise)pipelinePromise=(async()=>{
  const {pipeline,env}=await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/dist/transformers.min.js');
  env.allowLocalModels=false;env.backends.onnx.wasm.numThreads=1;
  return pipeline('translation','Xenova/nllb-200-distilled-600M',{dtype:'q8',device:'wasm',progress_callback:p=>{if(p.status==='progress')postMessage({type:'progress',text:'Loading language model · '+Math.round(p.progress)+'%'});}});
 })().catch(e=>{pipelinePromise=null;throw e});
 return pipelinePromise;
}
let busy=false;
self.onmessage=async({data})=>{
 if(busy)return;busy=true;
 try{const pipe=await load();postMessage({type:'progress',text:'Translating on your device…'});const result=await pipe(data.text,{src_lang:data.direction==='en-ko'?'eng_Latn':'kor_Hang',tgt_lang:data.direction==='en-ko'?'kor_Hang':'eng_Latn',max_new_tokens:160});postMessage({type:'result',id:data.id,text:result[0].translation_text});}
 catch(e){postMessage({type:'error',id:data.id,text:'The local model could not load or translate. Check your connection, then try again. '+e.message});}
 finally{busy=false;}
};

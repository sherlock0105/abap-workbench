const key='abap-documents-v1';
let data={saved:[],recent:[]};
try{const x=JSON.parse(localStorage.getItem(key)||'{}');data.saved=Array.isArray(x.saved)?x.saved.filter(v=>typeof v==='string'):[];data.recent=Array.isArray(x.recent)?x.recent.filter(v=>typeof v==='string').slice(0,12):[];}catch{}
const persist=()=>{try{localStorage.setItem(key,JSON.stringify(data));}catch{}document.dispatchEvent(new CustomEvent('personal-docs-change'));};
export const documentSaved=id=>data.saved.includes(id);
export function toggleDocument(id){data.saved=documentSaved(id)?data.saved.filter(x=>x!==id):[id,...data.saved];persist();return documentSaved(id);}
export function visitDocument(id){data.recent=[id,...data.recent.filter(x=>x!==id)].slice(0,12);persist();}
export const exportDocuments=()=>({...data});
export function mergeDocuments(x){if(!x||typeof x!=='object')return;for(const k of ['saved','recent'])if(Array.isArray(x[k]))data[k]=[...new Set([...x[k].filter(v=>typeof v==='string'&&v.length<120),...data[k]])];data.recent=data.recent.slice(0,12);persist();}

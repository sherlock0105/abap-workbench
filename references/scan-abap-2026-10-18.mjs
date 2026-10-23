import fs from 'node:fs';
const docs=JSON.parse(fs.readFileSync('dist/archive/index.json','utf8'));
const notion=docs.filter(x=>x.source==='Notion');
const idFrom=u=>String(u).match(/([0-9a-f]{32}|[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12})/i)?.[1]?.replaceAll('-','').toLowerCase();
const ids=new Set(notion.map(d=>idFrom(d.id)||idFrom(d.url)));
const refs=new Map();
for(const d of notion){
 const t=String(d.text||d.body||'').replace(/<ancestor-path>[\s\S]*?<\/ancestor-path>/g,'');
 for(const m of t.matchAll(/https:\/\/(?:app\.notion\.com|(?:www\.)?notion\.so|[a-zA-Z0-9.-]+\.notion\.site)\/[^"'\s)<]+/g)){
  const id=idFrom(m[0]);if(!id||ids.has(id))continue;
  const r=refs.get(id)||{id,url:m[0],parents:[]};
  r.parents.push({id:d.id,title:d.title});refs.set(id,r);
 }
}
const report={total:docs.length,notion:notion.length,firstKeys:Object.keys(notion[0]),missingReferences:[...refs.values()]};
fs.mkdirSync('references',{recursive:true});fs.writeFileSync('references/abap-local-linkscan-2026-10-18.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report));
console.log('ROOTPREVIEW '+JSON.stringify(notion.find(d=>idFrom(d.id)==='2a8a6b8522df807292e6ccd2577cbe76')?.text?.slice(0,300)));


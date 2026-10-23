import fs from 'node:fs';import z from 'node:zlib';
const path='dist/archive/index.json.gz';const index=JSON.parse(z.gunzipSync(fs.readFileSync(path)));
for(const change of JSON.parse(fs.readFileSync('references/curated-corrections.json'))){
 const p='dist/archive/docs/'+change.id+'.json.gz';const d=JSON.parse(z.gunzipSync(fs.readFileSync(p)));d.originalBody??=d.body;Object.assign(d,change);d.search=(d.title+' '+d.summary+' '+d.body).normalize('NFKC').toLowerCase();fs.writeFileSync(p,z.gzipSync(JSON.stringify(d)));Object.assign(index.find(x=>x.id===d.id),{title:d.title,summary:d.summary,category:d.category,recipe:d.recipe,text:d.body,search:d.search});
}
fs.writeFileSync(path,z.gzipSync(JSON.stringify(index)));
const cp='dist/archive/coverage.json.gz';const c=JSON.parse(z.gunzipSync(fs.readFileSync(cp)));c.recipeCount=index.filter(d=>d.recipe).length;c.categories=Object.fromEntries([...new Set(index.map(d=>d.category))].map(k=>[k,index.filter(d=>d.category===k).length]));fs.writeFileSync(cp,z.gzipSync(JSON.stringify(c)));
console.log('Curated corrections applied; exact original bodies retained.');

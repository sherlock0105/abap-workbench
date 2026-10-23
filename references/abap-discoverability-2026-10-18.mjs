import fs from 'node:fs';
import {workNotes} from '../dist/notes-data.js';
import {catalogGroups,topicMatch,isReadableDoc} from '../dist/catalog-data.js';
import {quickEntries} from '../dist/quick-data.js';
const docs=JSON.parse(fs.readFileSync('dist/archive/index.json','utf8')).filter(d=>d.source==='Notion');
const checked=JSON.parse(fs.readFileSync('references/abap-comparison-2026-10-18.json','utf8'));
const snippets=checked.filter(x=>x.id.startsWith('3eea'));
const imageOnly=[];
for(const d of docs){
 if(d.text.includes('```'))continue;
 const images=(d.text.match(/!\[[^\]]*\]\([^)]+\)/g)||[]);
 if(!images.length)continue;
 const prose=d.text.replace(/!\[[^\]]*\]\([^)]+\)/g,'').replace(/<[^>]+>/g,'').replace(/[\s#*_>—-]/g,'');
 if(!prose.length)imageOnly.push({id:d.id,title:d.title,images:images.length});
}
console.log(JSON.stringify({workNoteCount:workNotes.length,quickCount:quickEntries.length,catalogGroups:catalogGroups.length,imageOnly,snippets:snippets.map(x=>{const d=docs.find(d=>d.id==='notion-'+x.id);return{id:x.id,title:x.title,codeBlocks:x.codeBlocks,curatedNoteDirectLinks:workNotes.filter(n=>JSON.stringify(n.links).includes(x.id)).map(n=>({id:n.id,title:n.title})),reachableCatalogTasks:catalogGroups.flatMap(g=>g.topics.filter(t=>topicMatch(d,g.id,t.id)).map(t=>g.id+'/'+t.id)),readable:isReadableDoc(d)}})}));


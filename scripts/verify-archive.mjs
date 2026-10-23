import {readData} from './read-data.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderDocument,inline} from '../dist/document-renderer.js';
import {eventCatalog,eventFlows} from '../dist/event-catalog.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=async name=>readData(root+'/'+name);
const coverage=await read('dist/archive/coverage.json');
const index=await read('dist/archive/index.json'),notion=await read('references/notion-documents.json'),github=await read('references/github-documents.json');
assert.equal(index.length,notion.length+github.length+coverage.programGroups);assert.equal(new Set(index.map(d=>d.id)).size,index.length);
let rendered=0,codes=0;
for(const d of index){const full=await read('dist/archive/docs/'+d.id+'.json');assert.equal(full.body,d.text);assert.ok(d.search.includes(d.title.normalize('NFKC').toLowerCase()));const blocks=[];blocks.headings=[];renderDocument(full.format==='code'?'```abap\n'+full.body+'\n```':full.body,blocks);rendered++;codes+=blocks.length;}
for(const p of notion){const d=index.find(d=>d.id==='notion-'+p.id);let body=p.text;const a=body.indexOf('<content>'),b=body.lastIndexOf('</content>');if(a>=0&&b>=a)body=body.slice(a+9,b);else if(body.includes('<blank-page>'))body='';const corrected=await read('dist/archive/docs/'+d.id+'.json'); assert.equal(corrected.originalBody??d.text,body); if(corrected.originalBody){assert.ok(corrected.body.includes('##'));assert.ok(!/```abap\nSELECT SINGLE \.\.\./.test(corrected.body));if(corrected.id.endsWith('35ca6b8522df80a288d0dced5c835750'))assert.ok(corrected.body.includes('INTO @gv_exists'));}}
for(const g of github)assert.equal(index.find(d=>d.id===g.id).text,g.body);
const basic=await read('dist/archive/docs/notion-3e8a6b8522df8155b6dcd1da6fddca9c.json');assert.ok(basic.recipe);const bs=[];bs.headings=[];const html=renderDocument(basic.body,bs);assert.ok(bs.some(b=>b.code.startsWith('REPORT zr_scarr_basic.')));assert.ok(bs.some(b=>b.code.startsWith('PROCESS BEFORE OUTPUT.')));assert.ok(!bs.find(b=>b.code.startsWith('REPORT')).code.includes('PROCESS BEFORE OUTPUT.'));assert.ok(html.includes('data-archive-copy'));
const commented=`REPORT zcomment.
* 원본 전체 주석
DATA gv_text TYPE string. " 줄 끝의 원본 설명
" 마지막 주석
`;
const commentBlocks=[];commentBlocks.headings=[];const commentHTML=renderDocument('```abap\n'+commented+'```',commentBlocks);assert.equal(commentBlocks[0].code+'\n',commented);assert.ok(commentHTML.includes('원본 전체 주석'));assert.ok(commentHTML.includes('마지막 주석'));assert.ok(commentHTML.includes('주석 포함 복사'));
const malicious=renderDocument('<img src=x onerror=alert(1)>\n[x](javascript:alert)\n```abap\n<script>bad()</script>\n```',Object.assign([],{headings:[]}));assert.ok(!malicious.includes('<script>'));assert.ok(!malicious.includes('<img'));assert.ok(!inline('[x](javascript:bad)').includes('href='));
assert.equal(eventCatalog.length,31);assert.equal(new Set(eventCatalog.map(e=>e.id)).size,31);assert.equal(eventFlows.length,5);
for(const e of eventCatalog){assert.ok(e.sourceKeywords.length);assert.ok(index.some(d=>e.sourceKeywords.some(k=>(d.title+' '+d.text).toUpperCase().includes(k.toUpperCase()))),'No related docs: '+e.name)}
// Exercise source filters and full-body searches without a browser.
globalThis.CustomEvent=class {constructor(type){this.type=type}};globalThis.document={dispatchEvent(){}};
globalThis.fetch=async url=>({ok:true,json:()=>read('dist/'+url.replace('./',''))});
const store=await import('../dist/archive-store.js');await store.loadArchive();
for(const term of ['DATA_CHANGED','get_selected_rows','gt_fcat','READ TABLE','SMW0','INITIALIZATION','지급','SCARR'])assert.ok(store.findDocuments(term).length,'Missing search: '+term);
assert.ok(store.findDocuments('get_selected_rows').some(d=>!d.title.toLowerCase().includes('get_selected_rows')));assert.ok(store.findDocuments('',{source:'GitHub'}).every(d=>d.source==='GitHub'));assert.equal(store.findDocuments('<img onerror xxxxx').length,0);assert.equal(store.findDocuments('',{mode:'recipes'}).length,index.filter(d=>d.recipe).length+(await import('../dist/practice-docs.js')).practiceDocuments.filter(d=>d.recipe).length+(await import('../dist/practice-docs.js')).generatorDocuments.length+(await import('../dist/blog-lessons.js')).blogDocuments.filter(d=>d.recipe).length);
const app=await fs.readFile(root+'/dist/app.js','utf8');assert.ok(app.includes("?route:'work'"));assert.ok(app.includes('bindArchive({navigate,copy,download,toast,zip})'));
console.log(JSON.stringify({passed:true,documents:rendered,codeBlocks:codes,sourceBodiesExact:notion.length+github.length,events:31,recipes:coverage.recipeCount}));


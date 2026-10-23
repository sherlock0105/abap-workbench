import {practiceDocuments,generatorDocuments} from '../dist/practice-docs.js';
import {blogDocuments} from '../dist/blog-lessons.js';
import {readData} from './read-data.mjs';
import {learningDocuments} from '../dist/learning-docs.js';
import fs from 'node:fs/promises';import assert from 'node:assert/strict';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {catalogGroups,isReadableDoc,topicMatch} from '../dist/catalog-data.js';import {catalogBrowser,filterCatalog} from '../dist/catalog-view.js';import {glossary,termPanel,explainTerms,documentGuide} from '../dist/plain-language.js';import {eventCatalog} from '../dist/event-catalog.js';import {renderDocument} from '../dist/document-renderer.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),handlers={},elements={};
const classes=()=>{const set=new Set();return{add:v=>set.add(v),remove:v=>set.delete(v),contains:v=>set.has(v),toggle(v,force){const on=force??!set.has(v);on?set.add(v):set.delete(v);return on;}}};
function element(id){return elements[id]||=( {id:id.replace(/^#/,''),innerHTML:'',textContent:'',value:'',hidden:false,scrollTop:0,classList:classes(),setAttribute(){},removeAttribute(){},querySelector(){return{focus(){}}},closest(){return {hidden:false}},scrollIntoView(){}});}
globalThis.CustomEvent=class{constructor(type){this.type=type}};globalThis.document={querySelector:s=>s==='#term-dialog'?(elements[s]||null):element(s),querySelectorAll:()=>[],dispatchEvent(){},addEventListener:(type,fn)=>(handlers[type]||=[]).push(fn),createElement:()=>({innerHTML:'',setAttribute(){},addEventListener(){},showModal(){this.open=true},close(){this.open=false},remove(){delete elements['#'+this.id]}}),body:{append:d=>elements['#'+d.id]=d}};globalThis.location={hash:'#docs',href:'https://example.test/#docs'};globalThis.matchMedia=()=>({matches:false});globalThis.fetch=async url=>{try{const value=await readData(root+'/dist/'+url.replace('./',''));return{ok:true,json:async()=>value}}catch{return {ok:false}}};
const view=await import('../dist/archive-view.js');let copied,downloaded,navigated;view.bindArchive({copy:(code,title)=>copied={code,title},download:(name,body)=>downloaded={name,body},navigate:(page,id)=>navigated={page,id},zip:x=>x});
const click=async(dataset={},attributes=[])=>{const b={dataset,hasAttribute:a=>attributes.includes(a)};for(const fn of handlers.click||[])await fn({target:{closest:()=>b},preventDefault(){}})};
const idx=[...await readData(root+'/dist/archive/index.json'),...learningDocuments,...practiceDocuments,...generatorDocuments,...blogDocuments];
assert.equal(catalogGroups.length,18);assert.equal(catalogGroups.flatMap(g=>g.topics).length,100);assert.equal(new Set(catalogGroups.map(g=>g.id)).size,18);
for(const g of catalogGroups){assert.ok(idx.filter(isReadableDoc).some(d=>topicMatch(d,g.id,'')),g.title);assert.equal(new Set(g.topics.map(t=>t.id)).size,g.topics.length);for(const t of g.topics)if(!(g.id==='events'&&t.id==='f4'))assert.ok(idx.filter(isReadableDoc).some(d=>topicMatch(d,g.id,t.id)),g.title+' / '+t.title);}
view.archivePage();await view.renderArchive();assert.ok(element('#catalog-browser').innerHTML.includes('할 일을 먼저 고르세요'));assert.ok(element('.archive-workspace').hidden);assert.ok(!element('#catalog-browser').innerHTML.includes('원본 Include 묶음'));
await click({catalogTopic:'screen/flow'});assert.deepEqual(navigated,{page:'docs',id:'catalog/screen/flow'});
location.hash='#docs/catalog/screen/flow';view.archivePage();await view.renderArchive();assert.ok(!element('.archive-workspace').hidden);assert.ok(element('#catalog-browser').innerHTML.includes('화면 표시·버튼 처리 연결하기'));assert.ok(!element('#archive-results').innerHTML.includes('GitHub /'));
element('#archive-search').value='PBO';for(const fn of handlers.input)fn({target:element('#archive-search')});assert.ok(element('#archive-results').innerHTML.includes('data-result-copy='));
await click({},['data-catalog-home']);location.hash='#docs';view.archivePage();await view.renderArchive();element('#archive-search').value='get_selected_rows';for(const fn of handlers.input)fn({target:element('#archive-search')});assert.ok(element('#archive-results').innerHTML.includes('data-result-copy='));
location.hash='#docs/notion-3e8a6b8522df8155b6dcd1da6fddca9c';view.archivePage();await view.renderArchive();assert.ok(element('.archive-page').classList.contains('is-reading'));assert.ok(element('#archive-reader').innerHTML.includes('프로그램 전체'));assert.ok(element('#archive-reader').innerHTML.includes('화면 Flow Logic'));assert.ok(element('#archive-reader').innerHTML.includes('원문 주석 포함'));assert.ok(element('#archive-reader').innerHTML.includes('plain-guide'));assert.ok(element('#archive-reader').innerHTML.includes('data-term='));await click({},['data-document-copy']);assert.ok(copied.code.includes('## 4. 실행 확인'));assert.ok(copied.code.includes('REPORT zr_scarr_basic.'));await click({archiveCopy:'0'});assert.ok(copied.code.startsWith('REPORT zr_scarr_basic.'));assert.ok(!copied.code.includes('PROCESS BEFORE OUTPUT.'));await click({archiveCopy:'1'});assert.ok(copied.code.startsWith('PROCESS BEFORE OUTPUT.'));
await click({term:'normal'});assert.ok(elements['#term-dialog'].open);assert.ok(elements['#term-dialog'].innerHTML.includes('일반 화면'));await click({},['data-term-close']);assert.ok(!elements['#term-dialog']);await click({},['data-glossary-open']);assert.ok(elements['#term-dialog'].innerHTML.includes('Flow Logic'));await click({term:'flow'});assert.ok(elements['#term-dialog'].innerHTML.includes('Flow Logic 탭'));await click({},['data-term-close']);
assert.equal(glossary.length,31);const codeBlocks=[];codeBlocks.headings=[];const output=renderDocument('PBO와 PAI를 연결해요.\n```abap\nMODULE status_0100 OUTPUT.\n* PBO 원문 주석\nENDMODULE.\n```',codeBlocks);assert.ok(output.includes('data-term="pbo"'));assert.ok(output.includes('abap-control'));assert.deepEqual(codeBlocks[0].code,'MODULE status_0100 OUTPUT.\n* PBO 원문 주석\nENDMODULE.');assert.ok(!output.split('<pre')[1].includes('data-term='));assert.ok(!explainTerms('&lt;img src=x&gt;').includes('<img'));
const jumpLine={classList:classes(),offsetWidth:10,scrollIntoView:opts=>jumpLine.scrolled=opts};const foldButton={textContent:'전체 펼치기',setAttribute:(key,value)=>foldButton[key]=value};const section={classList:classes(),querySelector:q=>q==='[data-archive-fold]'?foldButton:jumpLine,querySelectorAll:()=>[]};section.classList.add('is-folded');const jump={value:'5',hasAttribute:key=>key==='data-form-jump',closest:()=>section};for(const fn of handlers.change)fn({target:jump});assert.ok(!section.classList.contains('is-folded'));assert.equal(foldButton['aria-expanded'],'true');assert.equal(jumpLine.scrolled.block,'center');assert.ok(jumpLine.classList.contains('form-jump-target'));
location.hash='#events/alv-double-click';view.archivePage();await view.renderArchive();assert.ok(element('#archive-status').textContent.includes('31'));assert.ok(element('#archive-reader').innerHTML.includes('선언·SET HANDLER'));assert.ok(element('#archive-results').innerHTML.includes('행을 더블클릭했을 때'));
location.hash='#recipes';view.archivePage();await view.renderArchive();assert.ok(element('#archive-status').textContent.includes(String(idx.filter(d=>d.recipe).length)));assert.ok(element('#catalog-browser').innerHTML.includes('할 일을 먼저 고르세요'));
let combined=0;for(const d of idx.filter(d=>d.id.startsWith('ghp-'))){const full=await readData(root+'/dist/archive/docs/'+d.id+'.json');if(full.combinedProgram){combined++;assert.ok(/^\s*(REPORT|PROGRAM)\s/im.test(full.combinedProgram));assert.ok(!/^\s*INCLUDE\s+[\w/]+\s*\./im.test(full.combinedProgram));assert.ok(!/^\s*PROCESS (BEFORE|AFTER)/im.test(full.combinedProgram));}}
assert.equal(combined,idx.filter(d=>d.recipe&&d.source==='GitHub').length);await click({},['data-archive-coverage']);assert.ok(element('#archive-reader').innerHTML.includes('3개'));
console.log(JSON.stringify({passed:true,groups:catalogGroups.length,subtopics:catalogGroups.flatMap(g=>g.topics).length,glossary:31,checks:['catalog landing','catalog deep links','subtopic filtering','readable defaults','full-body search','reading page','code and comments preserved','program/flow copy','term dialog','event explanations','recipes','coverage'],combinedPrograms:combined}));

assert.ok(!topicMatch(idx.find(d=>d.id==='notion-3eea6b8522df81bface3c94094dc4e62'),'events','f4'));

// Authored documents must use the same search, deep-link reader and copy path.
const store=await import('../dist/archive-store.js');
for(const term of ['ZSH_PDH_BLART','ZSH_PDH_TAX','11010100','GS_INPUT-ACCOUNT_TEXT']){
 assert.ok(store.findDocuments(term).some(d=>d.source==='학습 문서'),term);
}
for(const d of learningDocuments){
 assert.ok(isReadableDoc(d));
 assert.ok(filterCatalog([d],{groupId:'f4-text'}).length);
 location.hash='#docs/'+d.id;view.archivePage();await view.renderArchive();
 assert.ok(element('#archive-reader').innerHTML.includes(d.title));
 assert.ok(element('#archive-reader').innerHTML.includes('SAP 실행 미검증'));
 await click({},['data-document-copy']);assert.ok(copied.code.includes(d.body));
 const blocks=[];blocks.headings=[];renderDocument(d.body,blocks,d);
 assert.ok(blocks.length>=2);assert.ok(blocks.headings.length>=5);
}
assert.ok(store.findDocuments('F0001 11010100').some(d=>d.id==='learn-f4-account'));
console.log(JSON.stringify({learningDocuments:4,search:true,deepLinks:true,copy:true,rendered:true}));

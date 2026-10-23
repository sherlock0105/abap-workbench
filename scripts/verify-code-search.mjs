import assert from 'node:assert/strict';
import {readData} from './read-data.mjs';
import {codeBlocks,codeInfo,bestBlock,codePreview,resultBlocks,screenFlow} from '../dist/code-index.js';
import {renderDocument} from '../dist/document-renderer.js';
const raw=await readData('dist/archive/index.json');
assert.equal(codeInfo({format:'code',text:'* comment only\n" comment'}).hasCode,false);
assert.equal(codeInfo({format:'code',path:'.gitattributes',text:'*.html linguist-language=ABAP'}).hasCode,false);
assert.equal(codeInfo({format:'code',text:'  \n'}).kind,'empty');
assert.equal(codeInfo({text:'![capture](notion-file-block:123)'}).kind,'capture');
assert.equal(codeInfo({text:'Some explanation only.'}).hasCode,false);
const nested={format:'markdown',text:'## First\n\t```abap\nREPORT ztest.\n* Preserve this comment\nWRITE / \'Hello\'.\n\t```\n## Empty\n```abap\n* no implementation\n```\n## Flow\n```abap\nPROCESS BEFORE OUTPUT.\n MODULE status_0100.\n```'};
assert.equal(codeBlocks(nested).length,2);
assert.deepEqual(codeBlocks(nested).map(b=>b.index),[0,2]);
for(const d of [nested,...raw.filter(d=>d.source==='Notion'&&codeInfo(d).hasCode).slice(0,30)]){
 const rendered=[];rendered.headings=[];renderDocument(d.text,rendered,d);
 for(const b of codeBlocks(d))assert.equal(b.code,rendered[b.index].code,d.id);
}
globalThis.document={dispatchEvent(){}};globalThis.CustomEvent=class{};
globalThis.fetch=async url=>({ok:true,json:()=>readData('dist/'+url.replace('./',''))});
const {loadArchive,findDocuments,findPractical}=await import('../dist/archive-store.js');
const documents=await loadArchive();
for(const query of ['행 삭제','더블클릭','f4_belnr','INITIALIZATION','값도움','VALIDATION','READ TABLE']){
 const list=findDocuments(query,{availability:'code'});assert.ok(list.length,query);
 assert.ok(list.every(d=>codeInfo(d).hasCode));
}
const deletion=findDocuments('행 삭제',{availability:'code'})[0];
assert.match(deletion.title,/행 삭제/);assert.match(bestBlock(deletion,'행 삭제').code,/DELETE/i);
assert.ok(codePreview(bestBlock(deletion,'행 삭제'),'행 삭제').text.length);
const rawFi=documents.find(d=>/^zre3fi0003_f01$/i.test(d.title));
assert.ok(rawFi);assert.equal(codeBlocks(rawFi)[0].code,rawFi.text);
assert.ok(findDocuments('f4_belnr',{availability:'code'}).includes(rawFi));
const procedure=resultBlocks(rawFi,'f4_belnr').find(b=>b.procedure);assert.ok(procedure);assert.match(procedure.code,/FORM f4_belnr[\s.]/i);assert.match(procedure.code,/ENDFORM\.[\r\n]*$/);assert.ok(procedure.code.length<rawFi.text.length);assert.ok(rawFi.text.includes(procedure.code));
assert.ok(findDocuments('',{availability:'reference'}).every(d=>!codeInfo(d).hasCode&&codeInfo(d).kind!=='empty'));
const screen=documents.find(d=>/^%_DYNPRO\s*$/m.test(d.text)&&codeInfo(d).hasCode);assert.ok(screen);const flow=codeBlocks(screen)[0];assert.ok(flow.screenFlow);assert.match(flow.code,/PROCESS BEFORE OUTPUT/);assert.ok(!flow.code.includes('%_'));assert.ok(screen.text.includes(flow.code));assert.equal(screenFlow('%_DYNPRO\n%_FLOWLOGIC\nPROCESS BEFORE OUTPUT.\n MODULE x.\n%_END\nmetadata'),'PROCESS BEFORE OUTPUT.\n MODULE x.\n');
assert.ok(findPractical('행 삭제').length<=6);assert.ok(findPractical('MAKE_FCAT').length<=6);assert.ok(findPractical('f4_belnr').some(d=>d.id===rawFi.id));assert.ok(findPractical('F4').every(d=>d.source!=='GitHub'));
const {resultCard}=await import('../dist/code-results.js');
const html=resultCard({...deletion,title:'<script>alert(1)</script>'},'<img>');
assert.ok(!html.includes('<script>'));assert.ok(!html.includes('<img>'));
console.log(JSON.stringify({passed:true,total:documents.length,kinds:documents.reduce((a,d)=>(a[d.codeInfo.kind]=(a[d.codeInfo.kind]||0)+1,a),{}),checks:['actual code availability','empty and configuration separation','indented fence mapping','raw source and comment preservation','code-only search','Korean function ranking','FI FORM search','safe rendering']}));

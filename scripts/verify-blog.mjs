import assert from 'node:assert/strict';
import {blogDocuments} from '../dist/blog-lessons.js';
import {generate} from '../dist/generators.js';
import {practiceDocuments,generatorDocuments} from '../dist/practice-docs.js';
import {learningDocuments} from '../dist/learning-docs.js';
import {readData} from './read-data.mjs';
import {catalogGroups,topicMatch} from '../dist/catalog-data.js';
import {renderDocument} from '../dist/document-renderer.js';
const originals=await readData('dist/archive/index.json');
const all=[...originals,...practiceDocuments,...generatorDocuments,...learningDocuments,...blogDocuments];
assert.equal(new Set(all.map(d=>d.id)).size,all.length);
assert.equal(blogDocuments.length,31);
for(let n=2;n<=31;n++){
 const d=blogDocuments.find(d=>d.blogPost===n);assert.ok(d,'missing post '+n);
 assert.ok(d.body.includes('https://yulbaper.tistory.com/'+n));
 assert.ok(catalogGroups.some(g=>topicMatch(d,g.id,'')),d.title);
 const blocks=Object.assign([],{headings:[]});const html=renderDocument(d.body,blocks);
 assert.ok(html.includes('율밥퍼 원문'));
 for(const m of d.body.matchAll(/#docs\/([a-zA-Z0-9_-]+)/g))assert.ok(all.some(x=>x.id===m[1]),'broken link '+m[1]);
 for(const block of blocks)assert.ok(!block.code.includes('...'),'placeholder in '+d.id);
}
const f4=generate('alv-newko',{program:'ZQA_NEWKO',screen:'0990',container:'CC_DEMO',objectPrefix:'go_'});
assert.equal(f4.length,8);assert.ok(f4.find(f=>f.name==='screen_0990.flow.abap').code.includes('MODULE command_0990.'));
const joined=f4.map(f=>f.code).join('\n');
for(const token of ["container_name = 'CC_DEMO'",'go_grid','register_f4_for_fields','getbefore = abap_true','chngeafter = abap_true',"WHEN 'D'.","WHEN 'K'.","WHEN 'S'.","WHEN 'A'.",'fieldname = \'ANLN2\'','get_filtered_entries','et_row_no = lt_selected'])assert.ok(joined.includes(token),token);
assert.ok(!joined.includes('gcl_grid'));
const bdc=generate('fi-bdc-log').map(f=>f.code).join('\n');
assert.ok(bdc.indexOf('lv_subrc = sy-subrc. " 다른')>bdc.indexOf("CALL TRANSACTION 'FB01'"));
assert.ok(bdc.includes('WITH ls_message-msgv1 ls_message-msgv2 ls_message-msgv3 ls_message-msgv4'));
assert.ok(!bdc.includes('F5 312')); // no invented production success code
console.log(JSON.stringify({passed:true,reviewedArticles:30,newReadableDocuments:31,allDocuments:all.length,internalLinks:true,customGridNames:true}));

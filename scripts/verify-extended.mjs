import assert from 'node:assert/strict';
import fs from 'node:fs';
import {generate} from '../dist/generators.js';
import {extendedKinds} from '../dist/extended-generators.js';
import {practiceDocuments,generatorDocuments,validationTopics} from '../dist/practice-docs.js';
import {catalogGroups,topicMatch} from '../dist/catalog-data.js';
const db=['crud','db-create','db-update','db-delete'];
assert.equal(extendedKinds.length,44);assert.equal(new Set(extendedKinds.map(x=>x[0])).size,44);
for(const [kind] of extendedKinds){
 const files=generate(kind,{program:'ZCHECK_EXAMPLE',screen:'0200',screenField:'GV_ACCOUNT',container:'CC_TEST',...(db.includes(kind)?{table:'ZWB_DEMO',key:'ID'}:{})});
 assert.ok(files.length>0);assert.equal(new Set(files.map(x=>x.name)).size,files.length);
 assert.ok(files.every(f=>f.code.trim()&&f.where&&f.name));
 if(!['shdb','lock'].includes(kind))assert.ok(files.some(f=>f.code.includes('REPORT zcheck_example.')));
}
const f4=generate('f4-account',{program:'ZACCOUNT',screen:'0200',screenField:'GS_INPUT-ACCOUNT'});
const all=f4.map(x=>x.code).join('\n');
for(const term of ['BEGIN OF gs_input','account TYPE skb1-saknr','FORM f4_account.','FORM check_account.','DYNP_VALUES_READ','DYNP_VALUES_UPDATE',"retfield = 'SAKNR'",'PROCESS ON VALUE-REQUEST.','CHAIN.','FIELD gs_input-account.','INTO @lv_found',"gc_screen TYPE sy-dynnr VALUE '0200'"])assert.ok(all.includes(term),term);
assert.match(all,/IF sy-subrc <> 0 OR ls_return-fieldval IS INITIAL\.\s+RETURN\.\s+ENDIF\./);
const grid=generate('make-fcat',{objectPrefix:'go_',table:'T001',key:'BUKRS',container:'CC_TEST'}).map(x=>x.code).join('\n').replace(/\s+/g,' ');
for(const term of ['gt_fcat TYPE lvc_t_fcat','gs_fcat TYPE lvc_s_fcat','FORM make_fcat USING pv_key','PERFORM make_fcat USING','PERFORM set_fcat.',"container_name = 'CC_TEST'",'set_table_for_first_display','go_grid'])assert.ok(grid.includes(term),term);
assert.ok(!grid.includes('gcl_grid'));
for(const kind of db){assert.throws(()=>generate(kind,{table:'T001'}));const code=generate(kind,{table:'ZWB_DEMO',key:'ID'}).map(x=>x.code).join('\n');for(const term of ['WHERE id = @pa_id','COMMIT WORK AND WAIT','ROLLBACK WORK','gv_count = 1','cx_sy_open_sql_db'])assert.ok(code.includes(term));}
assert.throws(()=>generate('f4-account',{screen:'100'}));assert.throws(()=>generate('make-fcat',{table:"T001'."}));
assert.equal(validationTopics.length,12);assert.equal(practiceDocuments.length,14);assert.equal(generatorDocuments.length,44);
for(const t of validationTopics)assert.equal(practiceDocuments.filter(d=>topicMatch(d,'validation',t.id)).length,1);
assert.ok(catalogGroups.some(g=>g.id==='generation'));
const stat={passed:true,generatorChoices:49,extendedKinds:44,validationTypes:12,authoredDocuments:58,checks:['all kinds generate','names/screens/structured fields','F4 return/cancel/Enter','MAKE_FCAT/Grid integration','object prefix','DB key/LUW restrictions','invalid input rejection','catalog topic coverage']};
fs.mkdirSync('audit',{recursive:true});fs.writeFileSync('audit/extended-tests.json',JSON.stringify(stat,null,2));console.log(JSON.stringify(stat));

const {filterMultiCode,filterDocument}=await import('../dist/filter-docs.js');
assert.ok(filterMultiCode.indexOf('WHEN OTHERS.')<filterMultiCode.indexOf('LOOP AT gt_multi'));
for(const command of ['VIEW_ALL','VIEW_DONE','VIEW_WAIT','VIEW_ERROR'])assert.ok(filterMultiCode.includes(command));
assert.ok(filterMultiCode.includes('CHECK gcl_grid IS BOUND.'));
assert.ok(filterDocument.body.includes('직접 조립하지 말고'));
assert.equal(filterDocument.recipe,false);
assert.ok(topicMatch(filterDocument,'alv','filter'));

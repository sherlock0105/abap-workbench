import assert from 'node:assert/strict';
import fs from 'node:fs';
import lint from '@abaplint/core';
import parser from '../node_modules/@abaplint/core/build/src/rules/parser_error.js';
import {generateFieldTask,fieldPresets,catalogPresets} from '../dist/field-generator.js';
const {Registry,MemoryFile,Config}=lint;
let count=0;const failures=[];
function parse(name,code){const reg=new Registry(new Config(JSON.stringify({global:{files:'/**/*.abap'},syntax:{version:'v740sp08'},rules:{parser_error:true}})));reg.addFile(new MemoryFile('zfield.prog.abap',code));reg.parse();for(const obj of reg.getObjects())for(const issue of new parser.ParserError().initialize(reg).run(obj))failures.push({name,row:issue.getStart().getRow(),message:issue.getMessage()});count++;}
for(const p of fieldPresets)for(const screenType of ['selection','dynpro'])for(const task of ['f4','enter','listbox']){
 if(task==='listbox'&&p.large)continue;
 for(const helpMode of task==='f4'?['query','ddic']:['query']){
  const result=generateFieldTask({task,ddic:p.id,screenType,helpMode});
  const main=result.files.find(f=>f.name.includes('_complete.'));assert.ok(main);parse(p.id+' '+screenType+' '+task+' '+helpMode,main.code);
  assert.ok(!/^\s*INCLUDE\b/im.test(main.code));assert.ok(!/^\s*TYPES\b/im.test(main.code));
  if(task==='f4'){assert.ok(main.code.indexOf('READ TABLE lt_return')<main.code.indexOf('= ls_return-fieldval'));assert.ok(main.code.includes('DYNP_VALUES_READ'));assert.ok(main.code.includes('DYNP_VALUES_UPDATE'));assert.ok(main.code.includes('FORM check_input.'));if(helpMode==='query'&&p.context.length)for(const [key] of p.context)assert.match(main.code,new RegExp(key.toLowerCase()+' = @'));
  }
  if(task==='listbox')assert.ok(main.code.includes('VRM_SET_VALUES'));
  if(screenType==='dynpro'){const flow=result.files.find(f=>f.name.includes('.flow.'));assert.ok(flow);assert.ok(!main.code.includes('PROCESS BEFORE'));assert.match(flow.code,/AT EXIT-COMMAND/);if(task!=='enter')assert.ok(main.code.includes('MODULE status_0100 OUTPUT.'));}
 }
}
const custom=generateFieldTask({ddic:'ZMASTER-CODE',checkTable:'ZMASTER',checkKey:'CODE',textField:'TEXT',screenType:'dynpro',variable:'GS_INPUT-CODE',conversion:'ALPHA'});parse('custom structured',custom.files[0].code);assert.match(custom.files[0].code,/BEGIN OF gs_input/);
for(const [table,cols] of Object.entries(catalogPresets)){
 const result=generateFieldTask({task:'fcat',catalogTable:table,currencyField:'WAERS',localCurrencyField:'HWAER'}),top=result.files[0].code,form=result.files[1].code;
 parse(table+' make_fcat','REPORT zcat.\n'+top+'\nSTART-OF-SELECTION.\nPERFORM set_fcat.\n'+form);
 assert.equal((form.match(/APPEND gs_fcat TO gt_fcat/g)||[]).length,1);
 for(const [field] of cols)assert.ok(form.includes("'"+field+"'"),table+' '+field);
 assert.equal((form.match(new RegExp("'"+table+"'",'g'))||[]).length,cols.length);
 assert.match(form,/FORM make_fcat USING pv_key/);
}
const fcat=generateFieldTask({task:'fcat',catalogTable:'BKPF',columns:[{field:'BUKRS',label:'회사코드',key:true},{field:'BKTXT',label:"Text O'Brien",edit:true,hotspot:true}]});assert.match(fcat.files[1].code,/O''Brien/);assert.ok(!fcat.files[1].code.includes("fieldname = 'BELNR'"));
assert.throws(()=>generateFieldTask({ddic:'BKPF;DELETE-BUKRS'}));assert.throws(()=>generateFieldTask({ddic:'BKPF-BELNR',task:'listbox'}));assert.throws(()=>generateFieldTask({ddic:'BKPF-BUKRS',variable:'GV_TOO_LONG'}));assert.throws(()=>generateFieldTask({ddic:'ZTEST-CODE'}));assert.throws(()=>generateFieldTask({task:'fcat',columns:[]}));assert.throws(()=>generateFieldTask({task:'fcat',columns:[{field:'BUKRS'},{field:'BUKRS'}]}));
assert.deepEqual(failures,[]);
const report={passed:true,generatedProgramsChecked:count,presets:fieldPresets.length,checks:['selection and dynpro','query and DDIC F4','PAI Enter validation','F4 cancellation and screen buffers','dependent organization keys','listbox binding','selected MAKE_FCAT fields','custom DDIC and structure fields','input rejection','ABAP parser']};fs.mkdirSync('audit',{recursive:true});fs.writeFileSync('audit/field-builder-tests.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));

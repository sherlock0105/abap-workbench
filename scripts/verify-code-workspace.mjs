import {roleFiles} from '../dist/role-library.js';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {tokenizeCode} from '../dist/abap-highlight.js';
import {readableCode,codeOnlyHTML,htmlFiles,combinedProgram,isCodeFile,dataStyleFiles} from '../dist/code-tools.js';
import {generatorEntries,generatorPicker,majorGroups,middleGroups,libraryEntries} from '../dist/code-hierarchy.js';
import {generate} from '../dist/generators.js';
import {initializationRecipes} from '../dist/initialization-recipes.js';
const sample=`FORM sample.
DATA: lv_a TYPE i, lv_b TYPE string.
lv_b = 'Do not split. O''Brien'. " keep. comment
IF lv_a = 1. CLEAR lv_a. ELSE. lv_a = 2. ENDIF.
CASE lv_a.
WHEN 1. lv_b = 'One'.
WHEN OTHERS. lv_b = |Value. { lv_a }|.
ENDCASE.
ENDFORM.`;
const tokens=code=>tokenizeCode(code).flatMap(l=>l.tokens).filter(t=>t.text.trim()).map(t=>t.text.replace(/^\s+|\s+$/g,''));
const formatted=readableCode(sample);
assert.deepEqual(tokens(formatted),tokens(sample));
assert.equal(readableCode(formatted),formatted);
assert.match(formatted,/IF lv_a = 1\.\n\s+CLEAR lv_a\./);
assert.match(formatted,/CASE lv_a\.\n\s{4}WHEN 1\./);
assert.match(formatted,/lv_b = 'One'\.\n\n\s{4}WHEN OTHERS/);
assert.ok(formatted.includes("'Do not split. O''Brien'"));
const html=codeOnlyHTML('demo',formatted);
assert.ok(html.includes('background:#ffffe0'));
assert.equal((html.match(/<pre>/g)||[]).length,1);
assert.ok(!/<(?:button|h1|h2|script)\b/i.test(html));
assert.ok(!codeOnlyHTML('unsafe',"WRITE '<script>x</script>'.").includes('<script>'));
assert.ok(!html.includes('SAP 실행 미검증'));
const cds="@EndUserText.label: 'Travel'\n@UI.headerInfo: { typeName: 'Travel' }\ndefine root view entity ZI_TRAVEL as select from ztravel { key id }";
assert.equal(readableCode(cds),cds+'\n');
assert.ok(codeOnlyHTML('metadata.asddl',cds).includes('headerInfo'));
const scoped=dataStyleFiles([{name:'zscope.abap',code:'REPORT zscope.\nTYPES: BEGIN OF ty_row, id TYPE i, END OF ty_row.\nFORM process.\n  DATA ls_row TYPE ty_row.\n  ls_row-id = 1.\nENDFORM.'}])[0].code;
assert.match(scoped,/DATA:\s+BEGIN OF gs_row/);
assert.match(scoped,/FORM process\.\s+DATA ls_row LIKE gs_row\./);
assert.equal(initializationRecipes.length,8);
for(const e of generatorEntries){
 const picker=generatorPicker(e.kind);assert.equal(picker.selected.kind,e.kind);assert.ok(picker.leaves.some(r=>r.kind===e.kind));assert.ok(majorGroups.some(g=>g.id===e.major));assert.ok(middleGroups[e.major].some(([id])=>id===e.middle));
 const files=generate(e.kind,['crud','db-create','db-update','db-delete'].includes(e.kind)?{table:'ZWB_DEMO',key:'ID'}:{});
 for(const file of files.filter(isCodeFile)){
  assert.ok(!/^\s*TYPES\b/im.test(file.code),e.kind+' still declares TYPES');
  assert.ok(!/\bty_\w+\b/.test(file.code.split('\n').filter(l=>!/^\s*["*]/.test(l)).join('\n')),e.kind+' still refers to named local type');
 }
 assert.ok(htmlFiles(files).every(f=>f.name.endsWith('.html')));
 assert.equal(htmlFiles(files).length,files.filter(isCodeFile).length);
 if(e.kind.startsWith('init-')){const main=combinedProgram(files);assert.ok(main);assert.ok(main.code.includes('INITIALIZATION.'));assert.ok(main.code.includes('PERFORM set_init.'));assert.ok(main.code.includes('FORM set_init.'));assert.ok(!/^\s*INCLUDE\b/im.test(main.code));}
}
assert.ok(!libraryEntries.some(e=>['shdb','lock'].includes(e.kind)));
for(const entry of libraryEntries){const files=roleFiles(entry).filter(isCodeFile);assert.ok(files.length>0,entry.id+' has no code');assert.ok(files.every(f=>!/^\s*TYPES\b/im.test(f.code)),entry.id+' has a TYPES declaration');}
const report={passed:true,majorGroups:majorGroups.length,generatorChoices:generatorEntries.length,roleEntries:libraryEntries.length,initializationRoles:8,checks:['hierarchical coverage','no empty guide in code-first library','no local TYPES declaration','statement and comment preservation','formatter idempotence','HTML code only','HTML escaping','combined program includes expanded']};
fs.writeFileSync('audit/code-workspace-tests.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));

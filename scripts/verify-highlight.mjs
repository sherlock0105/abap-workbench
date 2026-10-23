import {readData} from './read-data.mjs';
import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {tokenizeCode,highlightCode,procedures,procedureTools} from '../dist/abap-highlight.js';
import {renderDocument} from '../dist/document-renderer.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sample=`REPORT ztest.
* FORM fake_comment.
DATA lv_text TYPE string VALUE 'He said "hello" and O''Brien'. " actual comment
DATA lv_template TYPE string VALUE |FORM fake_template { 'text' }|.
FORM get_data.
  SELECT * FROM scarr INTO TABLE @DATA(lt_data).
ENDFORM.
FORM refresh_grid USING pv_text TYPE string.
  gcl_grid->refresh_table_display( ).
ENDFORM.
`;
const tokenized=tokenizeCode(sample);assert.equal(tokenized.map(l=>l.tokens.map(t=>t.text).join('')).join('\n'),sample);assert.equal(procedures(sample).length,2);assert.deepEqual(procedures(sample).map(f=>f.name),['get_data','refresh_grid']);assert.equal(procedures(sample)[0].line,5);const html=highlightCode(sample);for(const cls of ['abap-control','abap-keyword','abap-string','abap-comment','abap-type','abap-function','form-color-0','form-color-1','form-start','form-end'])assert.ok(html.includes(cls),cls);assert.equal((html.match(/class="code-line/g)||[]).length,sample.split('\n').length);assert.equal((html.match(/\bform-start\b/g)||[]).length,2);assert.equal((html.match(/\bform-end\b/g)||[]).length,2);
assert.ok(procedureTools(sample,2).includes('get_data · 5줄'));assert.ok(procedureTools(sample,2).includes('data-code-block="2"'));
for(const code of ["DATA a TYPE string VALUE '<script>x</script>'.",'" <img src=x onerror=alert(1)>',"DATA text TYPE string VALUE `don't comment \" this`.\n",'/* FORM hidden.\nENDFORM. */\nFORM visible.\nENDFORM.','',"DATA x TYPE string VALUE 'a''b'.\r\n",'DATA x TYPE string VALUE |one\\|two\nthree|.']){const tokens=tokenizeCode(code);assert.equal(tokens.map(l=>l.tokens.map(t=>t.text).join('')).join('\n'),code);const h=highlightCode(code);assert.ok(!h.includes('<script>'));assert.ok(!h.includes('<img'));}
// Verify every archived code block, not just a synthetic example.
const index=await readData(root+'/dist/archive/index.json');let blocksCount=0,formsCount=0,linesCount=0;
for(const d of index){const full=await readData(root+'/dist/archive/docs/'+d.id+'.json');const blocks=[];blocks.headings=[];renderDocument(['code','text'].includes(full.format)?'```abap\n'+full.body+'\n```':full.body,blocks);for(const block of blocks){const rows=tokenizeCode(block.code);assert.equal(rows.map(l=>l.tokens.map(t=>t.text).join('')).join('\n'),block.code,d.id);blocksCount++;linesCount+=rows.length;formsCount+=procedures(block.code).length;}}
console.log(JSON.stringify({passed:true,codeBlocks:blocksCount,sourceLines:linesCount,forms:formsCount,checks:['keywords','types','strings and escaped quotes','comments','HTML escaping','FORM boundaries','FORM navigation','raw source unchanged']}));

const nested=[];nested.headings=[];renderDocument('\t```abap\n\tFORM nested.\n\t* keep this comment\n\tENDFORM.\n\t```',nested);assert.equal(nested.length,1);assert.equal(nested[0].code,'\tFORM nested.\n\t* keep this comment\n\tENDFORM.');

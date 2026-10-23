import {libraryEntries,generatorEntries} from '../dist/code-hierarchy.js';
import {roleFiles} from '../dist/role-library.js';
import {combinedProgram} from '../dist/code-tools.js';
import {initializationRecipes} from '../dist/initialization-recipes.js';
import {blogDocuments} from '../dist/blog-lessons.js';
import {filterMultiCode,filterTop,filterSnapshotCode} from '../dist/filter-docs.js';
import parser from '../node_modules/@abaplint/core/build/src/rules/parser_error.js';
import lint from '@abaplint/core';import {generate,defaults} from '../dist/generators.js';import {extendedKinds} from '../dist/extended-generators.js';import {practiceDocuments} from '../dist/practice-docs.js';
const {Registry,MemoryFile,Config}=lint;import fs from 'node:fs';
let failures=[],checked=0;
function check(name,code){const reg=new Registry(new Config(JSON.stringify({global:{files:'/**/*.abap'},syntax:{version:'v740sp08'},rules:{parser_error:true}})));reg.addFile(new MemoryFile('ztest.prog.abap',code));reg.parse();for(const obj of reg.getObjects()){const rule=new parser.ParserError().initialize(reg);for(const issue of rule.run(obj)) failures.push({name,message:issue.getMessage(),row:issue.getStart().getRow()});}checked++;}
for(const {kind:k} of generatorEntries.filter(e=>e.kind!=='rap')){const files=generate(k,['crud','db-create','db-update','db-delete'].includes(k)?{table:'ZWB_DEMO',key:'ID'}:{});let code=combinedProgram(files)?.code||files.filter(f=>f.name.endsWith('.abap')&&!f.name.includes('.flow.')).map(f=>f.code).join('\n').replace(/^INCLUDE .*\n/gmi,'');if(code)check(k,code);}
for(const d of [...practiceDocuments,...blogDocuments]){let n=0;for(const m of d.body.matchAll(/```abap\n([\s\S]*?)```/g)){if(m[1].startsWith('REPORT'))check(d.id+'-'+n++,m[1]);}}
check('filter_multi_integration','REPORT zfilter_check.\n'+filterTop+'\n'+filterMultiCode+'\n'+filterSnapshotCode);
for(const entry of libraryEntries.filter(e=>e.docId)){const main=combinedProgram(roleFiles(entry));if(main)check(entry.id+'-display',main.code);}
fs.mkdirSync('audit',{recursive:true});fs.writeFileSync('audit/parser-results.json',JSON.stringify({checked,failures},null,2));console.log(JSON.stringify({checked,failures},null,2));


if(failures.length)process.exitCode=1;

if(failures.length)process.exitCode=1;

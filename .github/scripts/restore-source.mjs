import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

const root=process.cwd();
const manifest=JSON.parse(await fs.readFile('.migration/manifest.json','utf8'));
const verifyOnly=process.argv[2]==='--verify-archive';
let archive=verifyOnly?path.resolve(process.argv[3]):path.join(process.env.RUNNER_TEMP||os.tmpdir(),'abap-workbench-source.tar.gz');
if(!verifyOnly){
 const out=await fs.open(archive,'w');
 try{
  for(const file of manifest.parts){
   if(!/^part-\d{4}\.bin$/.test(file))throw Error('Unexpected archive part');
   await out.writeFile(await fs.readFile(path.join('.migration',file)));
  }
 }finally{await out.close();}
}
const bytes=await fs.readFile(archive);
if(bytes.length!==manifest.size||createHash('sha256').update(bytes).digest('hex')!==manifest.sha256)throw Error('Site archive integrity check failed');
const allowed=/^(?:dist|scripts|references|audit)(?:\/|$)|^(?:README\.md|package\.json|pnpm-lock\.yaml|\.gitignore)$/;
const names=execFileSync('tar',['-tzf',archive],{encoding:'utf8',maxBuffer:16*1024*1024}).trim().split(/\r?\n/);
for(const name of names)if(!allowed.test(name)||name.split('/').includes('..')||name.startsWith('/'))throw Error('Unexpected archive path');
console.log(`Verified ${names.length} archive entries; SHA-256 matched.`);
if(!verifyOnly){
 execFileSync('tar',['-xzf',archive,'-C',root],{stdio:'inherit'});
 await fs.appendFile('.gitignore','\n__pycache__/\n*.pyc\n');
 execFileSync('git',['config','user.name','github-actions[bot]']);
 execFileSync('git',['config','user.email','41898282+github-actions[bot]@users.noreply.github.com']);
 execFileSync('git',['rm','-r','--','.migration'],{stdio:'inherit'});
 execFileSync('git',['add','--','dist','scripts','references','audit','README.md','package.json','pnpm-lock.yaml','.gitignore']);
 execFileSync('git',['commit','-m','Import complete ABAP Workbench site source'],{stdio:'inherit'});
 execFileSync('git',['push','origin','HEAD:main'],{stdio:'inherit'});
 console.log('Complete site source imported into main.');
}

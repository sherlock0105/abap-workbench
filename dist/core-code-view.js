import {standardSnippets,snippetParameters} from './standard-snippets.js';
import {combinedProgram,isCodeFile,readableCode} from './code-tools.js';

const focus={
 'alv-top':[/^create_top_/], 'alv-top-event':[/^on_top$/],
 'make-fcat':[/^set_fcat$/,/^make_fcat$/],
 'alv-toolbar':[/^on_toolbar$/,/^on_command$/],
 'alv-hotspot':[/^on_hotspot$/,/^on_double$/],
 'alv-edit':[/^on_changed$/],
 'alv-newko':[/^on_f4$/,/^handle_on_f4$/],
 'f4-account':[/^f4_account$/], 'f4-costcenter':[/^f4_costcenter$/],
 'f4-order':[/^f4_order$/], 'f4-wbs':[/^f4_wbs$/],
 'learn-alv-status-filter':[/^filter_multi$/],
 'fcat-checkbox':[/^set_fcat$/,/^make_fcat$/],
 'fcat-currency':[/^set_fcat$/,/^make_fcat$/],
 'fcat-hotspot':[/^make_fcat$/,/^handle_hotspot$/],
 'fcat-edit':[/^make_fcat$/,/^check_input$/],
 'fcat-style':[/^set_init$/,/^make_fcat$/],
 'fcat-color':[/^set_init$/,/^make_fcat$/],
 'fcat-ddic':[/^set_fcat$/]
};
function procedures(files){
 const code=files.filter(isCodeFile).map(f=>f.code).join('\n'),found=[];
 const re=/^[ \t]*(FORM|METHOD|MODULE)\s+([\w]+)\b[\s\S]*?^[ \t]*END(?:FORM|METHOD|MODULE)\s*\./gim;
 for(const m of code.matchAll(re))found.push({name:m[2].toLowerCase(),code:m[0]});
 return found;
}
export function coreCode(entry,generated){
 const authored=standardSnippets[entry.kind];if(authored)return readableCode(authored.core);
 const blocks=procedures(generated),rules=entry.kind.startsWith('init-')?[/^set_init$/]:focus[entry.kind]||focus[entry.id];
 let selected=rules?blocks.filter(b=>rules.some(r=>r.test(b.name))):[];
 if(!selected.length){
  const forms=blocks.filter(b=>!/^status_|^exit_|^command_|^user_command_/.test(b.name));
  selected=forms.filter(b=>/check|validate|f4_|convert|build|maintain|upload|download/.test(b.name));
  if(!selected.length)selected=forms.slice(0,1);
 }
 if(selected.length)return readableCode(selected.map(b=>b.code).join('\n\n'));
 const source=generated.find(f=>isCodeFile(f)&&!f.name.includes('.flow.'));
 return readableCode(source?.code||'');
}
export function roleCodeFiles(entry,generated){
 const core=coreCode(entry,generated),main=combinedProgram(generated),codeFiles=generated.filter(isCodeFile);
 const files=[{name:entry.id+'_core.abap',label:'핵심 코드',where:standardSnippets[entry.kind]?'F01 · 실제 표준 테이블 조회 + 핵심 처리':'기존 프로그램에 붙일 핵심 처리 · 선언·화면 조건은 별도 탭',code:core,core:true}];
 const top=codeFiles.filter(f=>/_(?:top|s01)\.abap$/i.test(f.name));
 if(top.length)files.push({name:entry.id+'_context.abap',label:'조회조건·선언',where:'필요한 입력값·전역 선언 · 기존 프로그램에 이미 있으면 생략',code:readableCode(top.map(f=>f.code).join('\n\n')),context:true});
 if(main){
  const byName=new Map(codeFiles.map(f=>[f.name.replace(/\.abap$/i,'').toLowerCase(),f]));
  const bundled=new Set();
  const visit=f=>{if(!f||bundled.has(f.name))return;bundled.add(f.name);for(const m of f.code.matchAll(/^[ \t]*INCLUDE\s+(\w+)\s*\./gim))visit(byName.get(m[1].toLowerCase()));};
  visit(codeFiles.find(f=>/^\s*(?:REPORT|PROGRAM)\s/im.test(f.code)));
  files.push({...main,label:'전체 실행 코드',complete:true,bundledNames:[...bundled]});
 }
 else if(codeFiles.length)files.push({name:entry.id+'_full.abap',label:'전체 코드',where:'원본 코드 구역 모음',code:readableCode(codeFiles.map(f=>f.code).join('\n\n')),complete:true,bundledNames:codeFiles.map(f=>f.name)});
 return [...files,...codeFiles.map(f=>({...f,section:true}))];
}

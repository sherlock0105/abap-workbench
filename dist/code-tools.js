import {tokenizeCode} from './abap-highlight.js';
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// Whitespace only: periods inside strings, templates, comments and numbers stay intact.
export function readableCode(code){
 // CDS/BDEF dots belong to annotation names, rather than ABAP statement ends.
 if(/^\s*(?:@\w+\.|define\s+(?:(?:root|abstract|custom)\s+)?(?:view|table|entity|behavior)\b|annotate\s|(?:un)?managed\s+implementation\b|projection\s*;)/im.test(String(code)))return String(code).replace(/\r\n/g,'\n').trim()+'\n';
 const lines=[];let declaration=false,nesting=0;
 for(const row of tokenizeCode(String(code).replace(/\r\n/g,'\n'))){
  if(!row.raw.trim()){lines.push('');continue;}
  if(/^\s*(?:DATA|TYPES|CONSTANTS)\s*:/i.test(row.raw))declaration=true;
  let part='',indent=row.raw.match(/^\s*/)[0],pending=false;
  for(const token of row.tokens){
   if(pending&&token.kind==='comment'){lines[lines.length-1]+=' '+token.text;pending=false;continue;}
   if(pending&&!token.text.trim())continue;
   if(pending){part=indent;pending=false;}
   part+=token.text;
   if(!token.kind){if(token.text==='(')nesting++;if(token.text===')')nesting=Math.max(0,nesting-1);}
   if((token.text==='.'||declaration&&token.text===','&&nesting===0)&&!token.kind){lines.push(part.trimEnd());part='';pending=true;if(token.text==='.')declaration=false;else indent='      '+row.raw.match(/^\s*/)[0];}
  }
  if(part.trim())lines.push(part.trimEnd());
 }
 const result=[];let depth=0,continued=false;const cases=[];
 const closes=/^(?:END(?:IF|LOOP|CASE|DO|WHILE|TRY|AT|FORM|MODULE|METHOD|CLASS|FUNCTION|CHAIN)|ELSE(?:IF)?|WHEN|CATCH|CLEANUP)\b/i;
 const opens=/^(?:IF|LOOP|DO|WHILE|CASE|TRY|AT (?:FIRST|LAST|NEW|END OF)|FORM|MODULE|METHOD|FUNCTION|CHAIN)\b/i;
 const outdent=/^(?:ELSE(?:IF)?|WHEN|CATCH|CLEANUP)\b/i;
 for(const raw of lines){
  let text=raw.trim();if(!text){if(result.length&&result.at(-1)!=='')result.push('');continue;}
  const comment=/^(?:\*|")/.test(text);
  const ended=/\.\s*(?:".*)?$/.test(text);
  if(!comment){
   if(/^(?:FORM|MODULE|FUNCTION|CLASS|INITIALIZATION\.|START-OF-SELECTION\.|END-OF-SELECTION\.|AT SELECTION-SCREEN)/i.test(text)){depth=0;continued=false;cases.length=0;}
   if(/^WHEN\b/i.test(text)&&cases.length)depth=cases.at(-1)+1;
   else if(/^ENDCASE\b/i.test(text)&&cases.length)depth=cases.pop();
   else if(closes.test(text))depth=Math.max(0,depth-1);
  }
  // Keep existing continuation indentation for SQL, declarations and method arguments.
  const pad=continued?Math.max(depth*2,raw.match(/^\s*/)[0].length):depth*2;
  const previous=result.filter(Boolean).at(-1)||'';
  const boundary=!continued&&!comment&&(/^(?:FORM|MODULE|METHOD|FUNCTION|INITIALIZATION\.|START-OF-SELECTION\.|AT SELECTION-SCREEN|LOOP\b|IF\b|CASE\b|TRY\b)/i.test(text)||(/^WHEN\b/i.test(text)&&!/^\s*CASE\b/i.test(previous))||(/^\s*(?:REPORT|PROGRAM)\b/i.test(previous))||(/^(?:CLEAR|REFRESH|SORT|SELECT|CALL|PERFORM|CREATE OBJECT)\b/i.test(text)&&/^\s*(?:(?:DATA|CONSTANTS|TABLES|PARAMETERS|SELECT-OPTIONS)\b|\w+\s+(?:TYPE|LIKE)\b)/i.test(previous))||/^\s*END(?:IF|LOOP|CASE|TRY|AT|FORM|MODULE|METHOD|FUNCTION)\./i.test(previous));
  if(boundary&&result.length&&result.at(-1)!=='')result.push('');
  result.push((text.startsWith('*')?'':' '.repeat(pad))+text);
  if(!comment){if(/^CASE\b/i.test(text))cases.push(depth);if(opens.test(text)||outdent.test(text))depth++;if(/^(?:INITIALIZATION\.|START-OF-SELECTION\.|END-OF-SELECTION\.|AT SELECTION-SCREEN)/i.test(text))depth=1;continued=!ended;}
 }
 return alignCode(result).join('\n').replace(/\n{3,}/g,'\n\n').trim()+'\n';
}

// Align only simple, consecutive assignments at the same indentation.
// Token state excludes multiline strings/templates/comments from this whitespace pass.
function alignCode(lines){
 const rows=tokenizeCode(lines.join('\n'));
 const assignment=/^(\s*)((?:<[\w-]+>|\w+)(?:-[\w]+)*)\s*=(?!=|>)(.*)$/;
 const eligible=i=>{
  const m=lines[i]?.match(assignment);if(!m)return null;
  const first=rows[i].tokens.find(t=>t.text.trim());
  return first&&!['comment','string'].includes(first.kind)&&rows[i].tokens.some(t=>t.kind==='operator'&&t.text==='=')?m:null;
 };
 for(let i=0;i<lines.length;i++){
  const start=eligible(i);if(!start)continue;
  let end=i+1,width=start[2].length;
  while(end<lines.length){const m=eligible(end);if(!m||m[1]!==start[1])break;width=Math.max(width,m[2].length);end++;}
  if(end-i>1)for(let j=i;j<end;j++){const m=eligible(j);lines[j]=m[1]+m[2].padEnd(width)+' ='+m[3];}
  i=end-1;
 }
 return lines;
}

export function dataStyleFiles(files){
 let out=files.map(f=>({...f}));const types=[];
 const combined=out.filter(f=>/\.abap$/i.test(f.name)&&!f.name.includes('.flow.')).map(f=>f.code).join('\n');
 const used=new Set([...combined.matchAll(/\b([gl]s_\w+)\s+(?:TYPE|LIKE)\b/gi)].map(m=>m[1].toLowerCase()));
 for(const m of combined.matchAll(/TYPES\s*:\s*BEGIN OF\s+(\w+)\s*,([\s\S]*?)END OF\s+\1\s*\./gi)){
  const id=m[1],declared=[...combined.matchAll(new RegExp('\\b(gs_\\w+)\\s+TYPE\\s+'+id+'\\b','gi'))][0]?.[1];
  let work=declared||id.replace(/^ty_/i,'gs_');if(work===id)work='gs_'+id;
  if(!declared&&used.has(work.toLowerCase()))work+='_line';used.add(work.toLowerCase());types.push({id,work,body:m[2],original:m[0]});
 }
 // Named table aliases become LIKE references to an actual global table.
 const aliases=[];
 for(const m of combined.matchAll(/TYPES\s+(\w+)\s+TYPE\s+((?:STANDARD|SORTED|HASHED)?\s*TABLE OF\s+\w+[^.]*?)\./gi)){
  const existing=[...combined.matchAll(new RegExp('\\b(gt_\\w+)\\s+TYPE\\s+'+m[1]+'\\b','gi'))][0]?.[1];
  const table=existing||m[1].replace(/^ty_/i,'gt_')+'_type';
  aliases.push({id:m[1],definition:m[2],table,original:m[0],existing});
 }
 for(const f of out){if(!/\.abap$/i.test(f.name)||f.name.includes('.flow.'))continue;
  for(const alias of aliases){f.code=f.code.replace(alias.original,alias.existing?'':`DATA ${alias.table} TYPE ${alias.definition}.`);f.code=f.code.replace(new RegExp('\\b'+alias.table+'\\s+TYPE\\s+'+alias.id+'\\b','gi'),alias.table+' TYPE '+alias.definition);f.code=f.code.replace(new RegExp('\\bTYPE\\s+'+alias.id+'\\b','gi'),'LIKE '+alias.table);}
  for(const type of types){
   f.code=f.code.replace(type.original,`DATA: BEGIN OF ${type.work},${type.body}END OF ${type.work}.`);
   // Remove the existing work-area component while keeping its neighboring declarations.
   const work=new RegExp('\\b'+type.work+'\\s+TYPE\\s+'+type.id+'\\s*([,.])','gi');
   f.code=f.code.replace(work,(_,separator)=>separator==='.'?'__REMOVE_DECL__.':'__REMOVE_DECL__,');
   f.code=f.code.replace(/\bDATA\s*:\s*__REMOVE_DECL__,\s*/gi,'DATA: ').replace(/\bDATA\s*:?\s*__REMOVE_DECL__\./gi,'');
   f.code=f.code.replace(/,\s*__REMOVE_DECL__\./g,'.').replace(/__REMOVE_DECL__,\s*/g,'');
   f.code=f.code.replace(new RegExp('\\bTYPE\\s+((?:(?:STANDARD|SORTED|HASHED)\\s+)?TABLE OF)\\s+'+type.id+'\\b','gi'),'LIKE $1 '+type.work);
   f.code=f.code.replace(new RegExp('\\bTYPE\\s+'+type.id+'\\b','gi'),'LIKE '+type.work);
  }
 }
 return out.map(f=>/\.abap$/i.test(f.name)?{...f,code:readableCode(f.code)}:f);
}

export const isCodeFile=f=>!(/\.(?:txt|md|json)$/i.test(f.name));
export function argumentRows(rows,indent='    '){
 const width=value=>[...value].reduce((n,c)=>n+(/[^\x00-\xff]/.test(c)?2:1),0);
 const quoted=rows.map(row=>row.map(v=>"'"+String(v).replaceAll("'","''")+"'"));
 const widths=quoted[0]?.map((_,i)=>Math.max(...quoted.map(row=>width(row[i]))))||[];
 return quoted.map((row,i)=>indent+row.map((v,j)=>v+' '.repeat(j===row.length-1?0:widths[j]-width(v)+1)).join('')+(i===quoted.length-1?'.':',')).join('\n');
}
export function codeOnlyHTML(name,code){
 const source=readableCode(code);
 const colored=tokenizeCode(source).map(line=>line.tokens.map(t=>{
  const color=t.kind==='comment'?'#0000FF':t.kind==='string'?'#008000':['keyword','control','declaration'].includes(t.kind)?'#000080':null;
  return color?`<font color="${color}">${esc(t.text)}</font>`:esc(t.text);
 }).join('')).join('\n');
 return '<!DOCTYPE html>\n<html lang="ko"><head><meta charset="UTF-8"><title>'+esc(name)+'</title><style>body{background:#ffffe0;color:#111;margin:24px}pre{font:15px/1.75 Consolas,"D2Coding",monospace;tab-size:2;white-space:pre;overflow:auto}</style></head><body><pre>'+colored+'</pre></body></html>\n';
}
export const htmlFiles=files=>files.filter(isCodeFile).map(f=>({...f,name:f.name.replace(/\.[^.]+$/,'')+'.html',code:codeOnlyHTML(f.name,f.code)}));
export const joinedCode=files=>files.filter(isCodeFile).map(f=>'* '+f.name+'\n'+readableCode(f.code)).join('\n');
export function combinedProgram(files){
 const main=files.find(f=>/^\s*(?:REPORT|PROGRAM)\s/im.test(f.code));if(!main)return null;
 const lookup=new Map(files.map(f=>[f.name.replace(/\.abap$/i,'').toLowerCase(),f]));
 const expand=(code,seen)=>code.replace(/^\s*INCLUDE\s+(\w+)\s*\.\s*$/gim,(line,name)=>{
  const found=lookup.get(name.toLowerCase());if(!found||seen.has(name.toLowerCase()))return line;
  return expand(found.code,new Set([...seen,name.toLowerCase()]));
 });
 return {...main,name:main.name.replace(/\.abap$/i,'_complete.abap'),where:'실행 프로그램 · Include 펼친 전체 코드',code:readableCode(expand(main.code,new Set()))};
}

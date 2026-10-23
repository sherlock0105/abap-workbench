// Code availability is based on source contents, rather than the imported file label.
const cache=new WeakMap();
const norm=v=>String(v||'').normalize('NFKC').toLowerCase();
const codeLanguage=/^(?:abap|sql|cds|asddl|ddl|bdef|javascript|js|typescript|ts|xml|html|css|json)?$/i;
const abapStatement=/^\s*(?:REPORT|PROGRAM|INCLUDE|DATA|TYPES|TABLES|CONSTANTS|FIELD-SYMBOLS|PARAMETERS|SELECT-OPTIONS|FORM|ENDFORM|MODULE|ENDMODULE|METHOD|ENDMETHOD|CLASS|INTERFACE|SELECT|WITH|UPDATE|INSERT|MODIFY|DELETE|READ|LOOP|IF|CASE|CHECK|CLEAR|REFRESH|SORT|APPEND|COLLECT|CALL|PERFORM|CREATE|SET|GET|WRITE|MESSAGE|ASSIGN|UNASSIGN|MOVE|CONCATENATE|SPLIT|REPLACE|FIND|CONVERT|AUTHORITY-CHECK|PROCESS|FIELD|CHAIN|INITIALIZATION|START-OF-SELECTION|AT SELECTION-SCREEN|DEFINE|define\s+(?:root\s+)?view|annotate|managed|unmanaged|projection)\b/im;
function meaningful(code,lang){
 const body=code.split('\n').filter(l=>!/^\s*(?:\*|"|\/\/|#|<!--)/.test(l)).join('\n').trim();
 if(!body)return false;
 if(/^(?:javascript|js|typescript|ts|xml|html|css)$/i.test(lang))return /[{};<>]/.test(body);
 if(/^json$/i.test(lang))return false; // Settings and manifests belong with reference files.
 return abapStatement.test(body)||/^\s*@\w+\./m.test(body)||/^\s*[\w<>-]+\s*=.+[.;]\s*$/m.test(body);
}
export function codeBlocks(d){
 if(cache.has(d))return cache.get(d);
 const original=String(d.text??d.body??''),text=['code','text'].includes(d.format)?original:original.replace(/\r\n/g,'\n'),list=[];
 if(d.format==='code'||d.format==='text'){
  const path=d.path||d.title||'';
  const flow=screenFlow(text);
  if(flow)list.push({index:0,lang:'abap',code:flow,label:'화면 Flow Logic · SE51',screenFlow:true});
  else if(!/^%_DYNPRO\s*$/m.test(text)&&!/(?:^|\/)(?:\.[^/]+|package(?:-lock)?\.json|manifest\.json)|\.(?:ya?ml|properties|json|png|webp)$/i.test(path)&&meaningful(text,d.language||'abap'))list.push({index:0,lang:d.language||'abap',code:text,label:d.role||d.title});
 }else{
  let index=0;
  for(const m of text.matchAll(/^[ \t]*(`{3,})([^\n]*)\n([\s\S]*?)^[ \t]*\1[ \t]*$/gm)){
   const lang=m[2].trim(),code=m[3].replace(/\n$/,'');
   const heading=text.slice(0,m.index).match(/^\s*#{1,6}\s+(.+)$/gm)?.at(-1)?.replace(/^\s*#+\s*/,'');
   const program=code.match(/^\s*(REPORT|PROGRAM)\s+([\w/]+)/im),procedures=[...code.matchAll(/^\s*(FORM|METHOD|MODULE)\s+([\w~/-]+)/gim)];
   const identity=program||(procedures.length===1?procedures[0]:null);
   if(codeLanguage.test(lang)&&meaningful(code,lang))list.push({index,lang:lang||'abap',code,label:identity?identity[1].toUpperCase()+' '+identity[2]:heading||'코드 '+(index+1)});
   index++;
  }
 }
 cache.set(d,list);return list;
}
export function screenFlow(text){
 if(!/^%_DYNPRO\s*$/m.test(text))return '';
 const flow=String(text).match(/^%_FLOWLOGIC[^\S\r\n]*\r?\n([\s\S]*?)(?=^%_|(?![\s\S]))/m)?.[1]||'';
 return /^\s*PROCESS (?:BEFORE|AFTER|ON)/im.test(flow)?flow:'';
}
export function codeInfo(d){
 const blocks=codeBlocks(d),body=String(d.text??d.body??'');
 const empty=!body.replace(/<empty-block\s*\/>|<table_of_contents\s*\/>|\s/g,'');
 const kind=blocks.length?'code':empty?'empty':/!\[|<image\b/.test(body)?'capture':d.format==='database'||/<page\b|<mention-page\b/.test(body)&&!body.replace(/<[^>]+>[\s\S]*?<\/[^>]+>|<[^>]+>|\s/g,'')?'index':'reference';
 return {hasCode:!!blocks.length,count:blocks.length,kind,label:blocks.length?(d.recipe?'전체 예제 · 코드 '+blocks.length+'개':'코드 '+blocks.length+'개'):({empty:'빈 원문',capture:'캡처·설명',index:'목차·연결',reference:'설명·설정'})[kind]};
}
export function blockScore(b,query){
 const words=norm(query).trim().split(/\s+/).filter(Boolean),code=norm(b.code),label=norm(b.label);
 const semantic=implementationTerms(query),statements=code.split('\n').filter(l=>!/^\s*["*]/.test(l)).join('\n');
 return semantic.reduce((n,w)=>n+(statements.includes(w)?25:0),0)+words.reduce((n,w)=>n+(label.includes(w)?15:0)+(code.includes(w)?8:0)+(code.match(new RegExp('(?:form|method|module)\\s+'+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b'))?20:0),0);
}
export function implementationTerms(query){
 const q=norm(query),terms=[];
 for(const [pattern,values] of [[/행\s*삭제|삭제|delete/,['delete']],[/행\s*추가|추가|append/,['append','insert']],[/더블\s*클릭|double_click/,['double_click']],[/값\s*도움|값도움|f4|search.help/,['f4','value_help','value-request']],[/초기값|기본값|initialization|set_init/,['initialization','set_init']],[/엑셀|업로드|upload/,['gui_upload','alsm_excel','upload']],[/검증|validation/,['validation','validate','check_']],[/필터|filter/,['filter','set_filter']]])if(pattern.test(q))terms.push(...values);
 return terms;
}
export function bestBlock(d,query=''){return codeBlocks(d).slice().sort((a,b)=>blockScore(b,query)-blockScore(a,query))[0];}
export function resultBlocks(d,query=''){
 const words=norm(query).trim().split(/\s+/).filter(w=>/^[a-z_][\w-]{2,}$/.test(w)),matches=[];
 if(!words.length)return codeBlocks(d).map(b=>({...b,key:String(b.index)}));
 for(const b of codeBlocks(d)){
  const lines=b.code.split('\n');
  for(let i=0;i<lines.length;i++){
   const start=lines[i].match(/^\s*(FORM|METHOD|MODULE)\s+([\w~/-]+)/i);
   if(!start||!words.some(w=>norm(start[2]).includes(w)))continue;
   const end=lines.findIndex((line,n)=>n>i&&new RegExp('^\\s*END'+start[1]+'\\s*\\.','i').test(line));
   if(end<0)continue;
   let from=i;while(from>0&&/^\s*\*/.test(lines[from-1]))from--;
   matches.push({...b,key:'procedure:'+b.index+':'+i,code:lines.slice(from,end+1).join('\n'),label:start[1].toUpperCase()+' '+start[2]+' · 처리 본문',procedure:true});
   i=end;
  }
 }
 return [...matches,...codeBlocks(d).map(b=>({...b,key:String(b.index)}))];
}
export function codePreview(block,query='',size=7){
 const lines=block.code.split('\n'),semantic=implementationTerms(query),words=semantic.length?semantic:norm(query).trim().split(/\s+/).filter(Boolean);
 let at=words.length?lines.findIndex(l=>!/^\s*["*]/.test(l)&&words.some(w=>norm(l).includes(w))):-1;
 if(at<0)at=lines.findIndex(l=>l.trim()&&!/^\s*["*]/.test(l));
 const start=Math.max(0,at-1),end=Math.min(lines.length,start+size);
 return {text:lines.slice(start,end).join('\n'),start:start+1,end,total:lines.length};
}

import {documents,findDocuments,findPractical,loadArchive} from './archive-store.js';
import {resultCard,referenceResults} from './code-results.js';
import {majorGroups,middleGroups,libraryEntries,roleDocuments} from './code-hierarchy.js';
import {generate,defaults} from './generators.js';
import {combinedProgram,codeOnlyHTML,isCodeFile,readableCode,dataStyleFiles} from './code-tools.js';
import {roleCodeFiles} from './core-code-view.js';
import {highlightCode,procedures} from './abap-highlight.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let deps={},search='',files=[],fileIndex=0,current;let searchLimit=6;const codeIndex=new Map();
export const isRoleRoute=()=>!location.hash.split('/')[1]||location.hash.startsWith('#docs/code');
export function rolePage(){return `<section class="role-page"><header class="role-head"><h1>필요한 코드만 찾기</h1></header><label class="role-search-label" for="role-search">기능 · FORM 이름</label><input type="search" id="role-search" placeholder="행 삭제, f4_belnr, 기본값, MAKE_FCAT…" value="${esc(search)}"><div class="practical-queries">${['F4','MAKE_FCAT','READ','LOOP','신문법','INITIALIZATION'].map(q=>`<button data-role-query="${q}">${q}</button>`).join('')}</div><div id="role-browser"></div></section>`;}

function path(){const p=decodeURIComponent(location.hash).split('/').slice(2);return {major:p[0]||'report',middle:p[1]||'initialization',id:p[2]||''};}
const route=(major,middle,id='')=>'code/'+major+'/'+middle+(id?'/'+id:'');
export function renderRoleLibrary(){
 const host=document.querySelector('#role-browser');if(!host)return;
 let {major,middle,id}=path();if(!majorGroups.some(g=>g.id===major))major='report';
 const all=libraryEntries.filter(e=>e.major===major),mids=middleGroups[major].filter(([id])=>all.some(e=>e.middle===id));
 if(!mids.some(([id])=>id===middle))middle=mids[0][0];
 const words=search.toLowerCase().trim().split(/\s+/).filter(Boolean);
 const generatedResults=entries=>`<details class="instant-roles" open><summary>역할별 핵심 코드 ${entries.length}개</summary><div>${entries.map(e=>`<button data-role-route="${route(e.major,e.middle,e.id)}"><strong>${esc(e.title)}</strong><small>${esc(e.description.split('\n')[0])}</small></button>`).join('')}</div></details>`;
 const list=words.length?libraryEntries.filter(e=>{if(!codeIndex.has(e.id))codeIndex.set(e.id,(e.title+' '+e.kind+' '+e.description+' '+e.middle+' '+e.major+' '+majorGroups.find(g=>g.id===e.major)?.title+' '+getFiles(e).filter(isCodeFile).map(f=>f.code).join(' ')).toLowerCase());return words.every(w=>codeIndex.get(e.id).includes(w));}):all.filter(e=>e.middle===middle);
 if(words.length)list.sort((a,b)=>Number(words.some(w=>(b.title+' '+b.kind).toLowerCase().includes(w)))-Number(words.some(w=>(a.title+' '+a.kind).toLowerCase().includes(w))));
 current=list.find(e=>e.id===id)||list[0];
 document.querySelector('.role-page')?.classList.toggle('is-searching',!!words.length);
 if(words.length){
  const code=findPractical(search),ddic=search.toUpperCase().match(/\b([A-Z][A-Z0-9_]{0,29}-[A-Z][A-Z0-9_]{0,29})\b/)?.[1]||'BKPF-BUKRS';
  const make=/make_fcat|fcat|필드.?카탈로그/i.test(search)?'fcat':/리스트|listbox|드롭다운/i.test(search)?'listbox':/enter|검증/i.test(search)?'enter':/f4|도움|서치헬프/i.test(search)?'f4':null;
  host.innerHTML=`${make?`<button class="practical-build" data-role-build="${make}" data-build-ddic="${esc(ddic)}"><strong>${make==='fcat'?'테이블로 MAKE_FCAT 만들기':ddic+' · '+({f4:'F4 + Enter',enter:'Enter 검증',listbox:'리스트박스'})[make]+' 만들기'}</strong><span>내 필드·변수명으로 생성 →</span></button>`:''}${list.length?generatedResults(list):''}<div class="instant-heading"><span role="status">${code.length}개 관련 예제</span></div><div class="instant-results">${code.slice(0,searchLimit).map(d=>resultCard(d,search)).join('')||`<p class="instant-empty">${documents.length?'일치하는 실무 예제가 없습니다. 기능명 또는 정확한 FORM 이름으로 찾아보세요.':'코드 색인을 불러오는 중…'}</p>`}</div>${code.length>searchLimit?`<button class="archive-more" data-role-more>6개 더 보기 (${searchLimit}/${code.length})</button>`:''}<button class="practical-original" data-role-original>원본 전체에서 검색</button>`;
  return;
 }
 if(!location.hash.startsWith('#docs/code')){
  host.innerHTML=`<div class="practical-categories">${majorGroups.map(g=>`<button data-role-route="${route(g.id,middleGroups[g.id][0][0])}"><strong>${esc(g.title)}</strong></button>`).join('')}</div><a class="practical-builder-link" href="#work">필드를 입력해서 F4 · Enter · MAKE_FCAT 만들기 →</a>`;return;
 }

 const majors=majorGroups.map(g=>`<button class="${g.id===major&&!words.length?'active':''}" data-role-route="${route(g.id,middleGroups[g.id].find(([mid])=>libraryEntries.some(e=>e.major===g.id&&e.middle===mid))[0])}"><strong>${esc(g.title)}</strong><span>${esc(g.description)}</span></button>`).join('');
 host.innerHTML=`<div class="hierarchy-label">1. 대분류</div><nav class="role-majors" aria-label="코드 대분류">${majors}</nav><div class="hierarchy-label">2. 중분류 · 실행 위치</div><nav class="role-middles" aria-label="실행 위치">${mids.map(([mid,label])=>`<button class="${mid===middle&&!words.length?'active':''}" data-role-route="${route(major,mid)}">${esc(label)}<small>${all.filter(e=>e.middle===mid).length}</small></button>`).join('')}</nav><div class="role-workspace"><aside><div class="hierarchy-label">3. 소분류 · 역할 ${list.length}개</div><div class="role-leaves">${list.map(e=>`<button class="${current?.id===e.id?'active':''}" data-role-route="${route(e.major,e.middle,e.id)}"><strong>${esc(e.title)}</strong><small>${esc(e.description.split('\n')[0])}</small></button>`).join('')||'<p>일치하는 코드가 없습니다. 짧은 키워드로 다시 검색하세요.</p>'}</div></aside><article id="role-detail"></article></div>`;
 fileIndex=0;renderDetail();
}
function getFiles(entry){
 if(entry.docId){
  const d=roleDocuments[entry.docId],files=[];
  for(const [i,m] of [...d.body.matchAll(/```(?:abap|sql|cds)?\n([\s\S]*?)```/g)].entries()){
   const header=d.body.slice(0,m.index).split('\n').reverse().find(l=>l.startsWith('## '))||'';
   const name=header.match(/^##\s+(\S+\.abap)/)?.[1]||m[1].match(/^\s*REPORT\s+(\w+)\./im)?.[1]+'.abap';
   files.push({name:name&&name!=='undefined.abap'?name:entry.id+'_'+i+'.abap',where:header.replace(/^## /,''),code:m[1]});
  }
  files.push({name:'00_README.txt',where:'적용 조건',code:d.body.replace(/```[^\n]*\n[\s\S]*?```/g,'')});
  return dataStyleFiles(files);
 }
 const program=entry.kind.startsWith('init-')?'ZSET_INIT':/^(read|loop|modern)-/.test(entry.kind)?'Z'+entry.kind.toUpperCase().replaceAll('-','_'):entry.kind==='alv-top'?'ZALV_HEADER':defaults.program;
 const opts={...defaults,program,...(['crud','db-create','db-update','db-delete'].includes(entry.kind)?{table:'ZWB_DEMO',key:'ID'}:{})};
 return generate(entry.kind,opts);
}
function renderDetail(){
 const host=document.querySelector('#role-detail');if(!host||!current)return;
 const generated=getFiles(current),main=combinedProgram(generated);
 files=roleCodeFiles(current,generated);
 const notes=generated.filter(f=>!isCodeFile(f));
 host.innerHTML=`<header class="role-detail-head"><span>${esc(majorGroups.find(g=>g.id===current.major).title)} / ${esc(middleGroups[current.major].find(([id])=>id===current.middle)[1])}</span><h2>${esc(current.title)}</h2><p>${current.description.split('\n').map(esc).join('<br>')}</p></header>${files.length?`<div class="role-code-actions"><button data-role-copy>현재 코드 복사</button><button class="primary" data-role-html>현재 코드 HTML 저장</button><button data-role-all-html>전체 코드 HTML 저장</button><button data-role-generate>${current.docId?'적용 설명 보기':'이름 바꿔 생성'}</button></div><nav class="role-files" aria-label="코드 구역">${files.map((f,i)=>!f.section?`<button class="${i===fileIndex?'active':''}" data-role-file="${i}">${esc(f.label||f.name)}</button>`:'').join('')}</nav><details class="role-section-files"><summary>TOP · F01 · 화면 등 구역별 파일</summary><nav class="role-files">${files.map((f,i)=>f.section?`<button data-role-file="${i}">${esc(f.name)}</button>`:'').join('')}</nav></details><div id="role-code"></div>`:'<p class="role-no-code">이 항목은 시스템 객체 준비 안내입니다. 실행 코드를 제공하는 항목과 구분합니다.</p>'}${notes.length?`<details class="role-prerequisites"><summary>필요한 화면·DDIC·전제 확인</summary>${notes.map(f=>`<pre>${esc(f.code)}</pre>`).join('')}</details>`:''}<footer>Standard ABAP · SAP GUI · 생성 코드의 SAP 실컴파일·실행은 별도 확인</footer>`;
 renderCode();
}
function renderCode(){const host=document.querySelector('#role-code'),file=files[fileIndex];if(!host||!file)return;host.innerHTML=`<div class="code-location">${esc(file.where)}<span>${file.code.split('\n').length}줄 · 코드와 주석</span></div>${procedures(file.code).length?`<label class="role-form-jump">FORM 바로가기<select id="role-form-jump"><option value="">${procedures(file.code).length}개 FORM</option>${procedures(file.code).map(f=>`<option value="${f.line}">${esc(f.name)}</option>`).join('')}</select></label>`:''}<pre class="abap-code role-code" tabindex="0"><code>${highlightCode(file.code)}</code></pre>`;document.querySelectorAll('[data-role-file]').forEach(b=>b.classList.toggle('active',Number(b.dataset.roleFile)===fileIndex));}
export function bindRoleLibrary(d){deps=d;
 document.addEventListener('change',e=>{if(e.target.id==='role-form-jump'&&e.target.value){const pre=document.querySelector('#role-code pre'),line=pre?.querySelector('[data-code-line="'+e.target.value+'"]');if(line){pre.scrollTop=line.offsetTop;pre.scrollIntoView({block:'nearest'});}}});
 document.addEventListener('archive-ready',()=>{if(document.querySelector('#role-search')&&search)renderRoleLibrary();});
 document.addEventListener('input',e=>{if(e.target.id==='role-search'){search=e.target.value;searchLimit=6;renderRoleLibrary();}});
 document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.roleQuery){search=b.dataset.roleQuery;searchLimit=6;document.querySelector('#role-search').value=search;renderRoleLibrary();return;}
  if(b.dataset.roleBuild){deps.buildTask(b.dataset.roleBuild,b.dataset.buildDdic,search.toUpperCase().match(/\b(?:BKPF|BSEG|SCARR)\b/)?.[0]);return;}
  if(b.hasAttribute('data-role-more')){searchLimit+=6;renderRoleLibrary();return;}
  if(b.dataset.roleRoute){search='';deps.navigate('docs',b.dataset.roleRoute);}
  if(b.hasAttribute('data-role-original'))deps.findOriginal(search);
  if(b.dataset.roleFile!==undefined){fileIndex=Number(b.dataset.roleFile);renderCode();}
  if(b.hasAttribute('data-role-copy')&&files[fileIndex])deps.copy(files[fileIndex].code,current.title);
  if(b.hasAttribute('data-role-html')&&files[fileIndex]){const f=files[fileIndex];deps.download(f.name.replace(/\.[^.]+$/,'.html'),codeOnlyHTML(f.name,f.code),'text/html;charset=utf-8');}
  if(b.hasAttribute('data-role-all-html')){const full=files.find(f=>f.complete);const code=[full,...files.filter(f=>f.section&&!full?.bundledNames?.includes(f.name))].filter(Boolean).map(f=>'* '+f.name+'\n'+readableCode(f.code)).join('\n');deps.download(current.id+'.html',codeOnlyHTML(current.title,code),'text/html;charset=utf-8');}
  if(b.hasAttribute('data-role-generate')){if(current.docId)deps.navigate('docs',current.docId);else deps.selectGenerator(current.kind);}
 });
}

export {getFiles as roleFiles};

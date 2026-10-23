import {codeInfo,bestBlock,blockScore} from './code-index.js';
import {blogDocuments} from './blog-lessons.js';
import {practiceDocuments,generatorDocuments} from './practice-docs.js';
import {fetchData} from './data-fetch.js';
import {catalogSearchAliases} from './catalog-data.js';
import {learningDocuments} from './learning-docs.js';
export let documents=[];
export let coverage={};
let loading;
export const normalize=v=>String(v||'').normalize('NFKC').toLowerCase();
export const categories=['전체','실무 보강 안내','반복·타입 심화','Smart Forms','유효성 검사','생성기 전체 예제','F4·텍스트 매핑','기초·문법','DDIC','ITAB·문자열','SQL·DB','화면·조회조건','ALV 표시·편집','이벤트','파일·엑셀','함수·클래스','BDC·전표','FI·업무','Gateway·CDS·Fiori','운영·확장','기타'];
export function loadArchive(){return loading ||= Promise.all([fetchData('./archive/index.json'),fetchData('./archive/coverage.json')]).then(([docs,c])=>{documents=[...docs,...learningDocuments,...practiceDocuments,...generatorDocuments,...blogDocuments].map(d=>({...d,codeInfo:codeInfo(d),search:d.search+' '+normalize(d.text)+' '+normalize(catalogSearchAliases(d))}));coverage={...c,documentCount:documents.length,learningDocuments:learningDocuments.length,blogDocuments:blogDocuments.length,categories:documents.reduce((all,d)=>{all[d.category]=(all[d.category]||0)+1;return all;},{})};document.dispatchEvent(new CustomEvent('archive-ready'));return documents;}).catch(e=>{loading=null;throw e});}
export function findDocuments(query='',{category='전체',source='전체',mode='all',availability='all'}={}){
 const words=normalize(query).trim().split(/\s+/).filter(Boolean);
 const alternatives=w=>({'값도움':['값도움','value help','value_help','f4'],'더블클릭':['더블클릭','double_click'],'초기값':['초기값','initialization','set_init'],'행삭제':['행삭제','행 삭제','delete']}[w]||[w]);
 return documents.filter(d=>(category==='전체'||d.category===category)&&(source==='전체'||d.source===source)&&(mode!=='recipes'||d.recipe)&&(mode!=='events'||d.category==='이벤트'||d.events?.length)&&(availability!=='code'||d.codeInfo.hasCode)&&(availability!=='reference'||!d.codeInfo.hasCode&&d.codeInfo.kind!=='empty')&&words.every(w=>alternatives(w).some(k=>d.search.includes(k)))).map(d=>{
  const title=normalize(d.title),path=normalize(d.path),body=normalize(d.text);
  const score=words.reduce((s,w)=>s+(title.includes(w)?60:0)+(path.includes(w)?12:0)+(body.includes(w)?5:0),0)+(d.codeInfo.hasCode?8:0)+(d.recipe?3:0)+(d.source==='Notion'?2:0);
  return {d,score:score+(words.length&&d.codeInfo.hasCode?blockScore(bestBlock(d,query),query):0)};
 }).sort((a,b)=>b.score-a.score||a.d.title.localeCompare(b.d.title,'ko')).map(r=>r.d);
}
export async function readDocument(id){return [...learningDocuments,...practiceDocuments,...generatorDocuments,...blogDocuments].find(d=>d.id===id)||fetchData('./archive/docs/'+encodeURIComponent(id)+'.json');}
export function snippet(d,query){const q=normalize(query).trim().split(/\s+/).find(Boolean);if(!q)return d.summary||'';const at=normalize(d.text).indexOf(q);return at<0?d.summary:d.text.slice(Math.max(0,at-55),at+150).replace(/\s+/g,' ');}

export function findPractical(query=''){
 const q=normalize(query).trim(),words=q.split(/\s+/).filter(Boolean);
 const dated=d=>/^(?:\d{1,2}[/.-]\d|abap 정리|rap 정리)|수업 원본|강의 기록|SAP-CODE|계층별 요약|객체·개발 순서|구축 지도/.test(d.title+' '+d.path);
 const groups=[['f4','값도움','검색도움','서치헬프','value_help','value-request'],['초기값','기본값','initialization','set_init'],['더블클릭','double_click'],['행삭제','delete','행 삭제'],['리스트박스','listbox','드롭다운','vrm_set_values'],['make_fcat','필드카탈로그','fieldcatalog']];
 const variants=w=>groups.find(g=>g.includes(w))||[w];
 const candidates=findDocuments(q,{availability:'code'}).filter(d=>{
  const heading=normalize(d.title+' '+(d.task?.title||'')+' '+(d.summary||'').slice(0,160));
  const named=words.some(w=>!['make_fcat','set_init','get_data','refresh_grid','display_alv'].includes(w)&&/^[a-z]\w*_\w+$/.test(w)&&new RegExp('^\\s*(?:form|method|module)\\s+'+w+'\\b','im').test(d.text));
  return named||d.source!=='GitHub'&&!dated(d)&&words.every(w=>variants(w).some(v=>heading.includes(v)));
 });
 const seen=new Set();return candidates.filter(d=>{const b=bestBlock(d,q);const signature=b.code.split('\n').filter(l=>!/^\s*["*]/.test(l)).join('').replace(/\s+/g,'').toLowerCase();if(seen.has(signature))return false;seen.add(signature);return true;});
}
